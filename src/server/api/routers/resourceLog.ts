import { createTRPCRouter, protectedWithUserProcedure, type TRPCContext, protectedProcedure } from "@/server/trpc";
import { PaginationInputSchema } from "@/schema/pagination.schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  ResourceUsageLogWhereInputSchema,
  type GPT4LogGroupbyAccountResult,
  type ResourceLogSumResult,
  ResourceUsageLogSchema,
} from "@/schema/resourceLog.schema";
import { paginateQuery } from "../pagination";
import { type SQL, and, count, eq, gte, lte, sql, countDistinct, desc } from "drizzle-orm";
import { resourceUsageLogs } from "@/server/db/schema";
import { UserRoles } from "@/schema/user.schema";
import { DURATION_WINDOWS, type DurationWindow, DurationWindowSchema, ServiceTypeSchema } from "@/server/db/enum";
import { alignTimeToGranularity } from "@/lib/utils";
import { memoize } from "@/lib/memoize";

const _sumChatGPTSharedLogsInDurationWindows = async ({
  ctx,
  durationWindows,
  timeEnd,
  userId,
  instanceId,
}: {
  ctx: TRPCContext;
  durationWindows: DurationWindow[];
  timeEnd: Date;
  userId?: string;
  instanceId?: string;
}): Promise<ResourceLogSumResult[]> => {
  const results = [] as ResourceLogSumResult[];

  for (const durationWindow of durationWindows) {
    const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
    const aggResult = await ctx.db
      .select({
        userCount: countDistinct(resourceUsageLogs.userId),
        count: count(),
        sumUtf8Length: sql<number>`sum(${resourceUsageLogs.textBytes})`.mapWith(Number),
        // sumTokensLength: sum(resourceUsageLogs.tokensLength).mapWith(Number),
        sumTokensLength: sql<number>`0`.mapWith(Number), // todo
      })
      .from(resourceUsageLogs)
      .where(
        and(
          eq(resourceUsageLogs.type, ServiceTypeSchema.Values.CHATGPT_SHARED),
          gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
          userId ? eq(resourceUsageLogs.userId, userId) : sql`true`,
          instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
        ),
      );
    // .groupBy(resourceUsageLogs.userId);

    results.push({
      durationWindow,
      stats: aggResult[0]!,
    });
  }

  return results;
};

const sumChatGPTSharedLogsInDurationWindows = memoize(_sumChatGPTSharedLogsInDurationWindows, {
  genKey: ({ durationWindows, timeEnd, userId, instanceId }) => {
    return JSON.stringify({ durationWindows, timeEnd, userId, instanceId });
  },
  shouldUpdate: (args, lastArgs) => {
    return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
  },
});

const _groupGPT4LogsInDurationWindow = async ({
  ctx,
  durationWindow,
  instanceId,
  timeEnd,
}: {
  ctx: TRPCContext;
  durationWindow: DurationWindow;
  instanceId?: string;
  timeEnd: Date;
}): Promise<GPT4LogGroupbyAccountResult> => {
  const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
  const groupByResult = await ctx.db
    .select({
      chatgptAccountId: sql<string | null>`${resourceUsageLogs.details}->>'chatgptAccountId'`,
      _count: count(),
    })
    .from(resourceUsageLogs)
    .where(
      and(
        eq(resourceUsageLogs.type, ServiceTypeSchema.Values.CHATGPT_SHARED),
        // sql`${resourceUsageLogs.createdAt} >= ${new Date(new Date().getTime() - durationWindowSeconds * 1000)}`,
        gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
        instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
        sql`${resourceUsageLogs.details}->>'model' LIKE 'gpt-4%'`,
      ),
    )
    .groupBy(sql`${resourceUsageLogs.details}->>'chatgptAccountId'`);
  // console.log("groupByResult", groupByResult);
  const result = {
    durationWindow,
    counts: groupByResult.map((item) => ({
      chatgptAccountId: item.chatgptAccountId,
      count: item._count,
    })),
  };
  return result;
};

const groupGPT4LogsInDurationWindow = memoize(_groupGPT4LogsInDurationWindow, {
  genKey: ({ durationWindow, instanceId }) => {
    return JSON.stringify({ durationWindow, instanceId });
  },
  shouldUpdate: (args, lastArgs) => {
    return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
  },
});

const PaginationResourceLogsInputSchema = z.object({
  where: ResourceUsageLogWhereInputSchema,
  pagination: PaginationInputSchema,
});

const getPaginatedResourceLogs = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof PaginationResourceLogsInputSchema>;
  ctx: TRPCContext;
}) => {
  return paginateQuery({
    pagination: input.pagination,
    ctx,
    responseItemSchema: ResourceUsageLogSchema,
    handle: async ({ skip, take, ctx }) => {
      const where = input.where;
      const andParams = [] as SQL[];
      if (where.userId) {
        andParams.push(eq(resourceUsageLogs.userId, where.userId));
      }
      if (where.instanceId) {
        andParams.push(eq(resourceUsageLogs.instanceId, where.instanceId));
      }
      if (where.timeStart) {
        andParams.push(gte(resourceUsageLogs.createdAt, where.timeStart));
      }
      if (where.timeEnd) {
        andParams.push(lte(resourceUsageLogs.createdAt, where.timeEnd));
      }
      const filter = and(...andParams);
      const { total, result } = await ctx.db.transaction(async (tx) => {
        const total = await tx
          .select({
            value: count(),
          })
          .from(resourceUsageLogs)
          .where(and(...andParams));
        const result = await tx
          .select()
          .from(resourceUsageLogs)
          .where(filter)
          .orderBy(desc(resourceUsageLogs.createdAt))
          .limit(take)
          .offset(skip);
        return { result, total: total[0]!.value };
      });
      return { result, total };
    },
  });
};

export const resourceLogRouter = createTRPCRouter({
  getMany: protectedWithUserProcedure
    .input(
      z.object({
        where: ResourceUsageLogWhereInputSchema,
        pagination: PaginationInputSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      const user = ctx.user;
      if (user.role !== UserRoles.ADMIN && user.id !== input.where.userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access this data" });
      }
      return getPaginatedResourceLogs({ input, ctx });
    }),

  sumLogsInDurationWindowsByUserId: protectedWithUserProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.user.id;
      if (ctx.user.role !== UserRoles.ADMIN && ctx.user.id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access this data" });
      }
      return sumChatGPTSharedLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        timeEnd: alignTimeToGranularity(60),
        userId,
      });
    }),

  sumLogsInDurationWindowsByInstance: protectedProcedure
    .input(
      z.object({
        instanceId: z.string(),
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // TODO: Check if the user has access to the instance
      return sumChatGPTSharedLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        timeEnd: alignTimeToGranularity(60),
        instanceId: input.instanceId,
      });
    }),

  sumLogsInDurationWindowsGlobal: protectedProcedure
    .input(
      z.object({
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return sumChatGPTSharedLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        timeEnd: alignTimeToGranularity(60),
      });
    }),

  groupGPT4LogsInDurationWindowByInstance: protectedProcedure
    .input(
      z.object({
        instanceId: z.string(),
        durationWindow: DurationWindowSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      return groupGPT4LogsInDurationWindow({
        ctx,
        durationWindow: input.durationWindow,
        instanceId: input.instanceId,
        timeEnd: alignTimeToGranularity(60),
      });
    }),
});
