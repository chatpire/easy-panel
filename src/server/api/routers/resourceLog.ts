import {
  createTRPCRouter,
  adminProcedure,
  protectedWithUserProcedure,
  type TRPCContext,
  protectedProcedure,
} from "@/server/trpc";
import {
  ResourceUnitSchema,
  UserResourceUsageLogSchema,
  UserResourceUsageLogWhereInputSchema,
} from "@/schema/generated/zod";
import { PaginationInputSchema } from "@/schema/pagination.schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";
import { DURATION_WINDOWS, DurationWindowSchema } from "@/schema/definition.schema";
import { type GPT4LogGroupbyAccountResult, type ResourceLogSumResult } from "@/schema/resourceLog.schema";
import { paginateQuery } from "../pagination";

const sumLogsInDurationWindows = async ({
  ctx,
  durationWindows,
  userId,
  instanceId,
  countUser
}: {
  ctx: TRPCContext;
  durationWindows: DurationWindow[];
  userId?: string;
  instanceId?: string;
  countUser?: boolean;
}): Promise<ResourceLogSumResult[]> => {
  if (countUser && userId === undefined) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "userId is required when countUser is true" });
  }

  const results = [] as ResourceLogSumResult[];

  for (const durationWindow of durationWindows) {
    const durationWindowSeconds = DURATION_WINDOWS[durationWindow as keyof typeof DURATION_WINDOWS];
    const aggResult = await ctx.db.userResourceUsageLog.groupBy({
      where: {
        timestamp: {
          gte: new Date(new Date().getTime() - durationWindowSeconds * 1000),
        },
        userId,
        instanceId,
      },
      by: ["userId"],
      _sum: { utf8Length: true, tokensLength: true },
      _count: true,
    });
    results.push({
      durationWindow,
      stats: aggResult.map((item) => ({
        userId: item.userId,
        count: item._count,
        utf8LengthSum: item._sum?.utf8Length ?? null,
        tokensLengthSum: item._sum?.tokensLength ?? null,
      })),
    });
  }

  return results;
};

const groupGPT4LogsInDurationWindow = async ({
  ctx,
  durationWindow,
  instanceId,
}: {
  ctx: TRPCContext;
  durationWindow: DurationWindow;
  instanceId?: string;
}): Promise<GPT4LogGroupbyAccountResult> => {
  const durationWindowSeconds = DURATION_WINDOWS[durationWindow as keyof typeof DURATION_WINDOWS];
  const groupByResult = await ctx.db.userResourceUsageLog.groupBy({
    where: {
      timestamp: {
        gte: new Date(new Date().getTime() - durationWindowSeconds * 1000),
      },
      instanceId,
      model: {
        startsWith: "gpt-4",
      },
    },
    by: ["openaiTeamId"],
    _count: true,
  });
  const result = {
    durationWindow,
    counts: groupByResult.map((item) => ({
      openaiTeamId: item.openaiTeamId,
      count: item._count,
    })),
  };
  return result;
};

export const resourceLogRouter = createTRPCRouter({
  getMany: adminProcedure
    .input(
      z.object({
        where: UserResourceUsageLogWhereInputSchema,
        pagination: PaginationInputSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      return paginateQuery({
        pagination: input.pagination,
        ctx,
        responseItemSchema: UserResourceUsageLogSchema,
        handle: async ({ skip, take, ctx }) => {
          const result = await ctx.db.userResourceUsageLog.findMany({
            where: input.where,
            skip,
            take,
          });
          const total = await ctx.db.userResourceUsageLog.count({
            where: input.where,
          });
          return { result, total };
        },
      });
    }),

  getAllByUser: protectedWithUserProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        pagination: PaginationInputSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      const userId = input.userId ?? ctx.user.id;
      if (ctx.user.role !== UserRole.ADMIN && ctx.user.id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access this data" });
      }
      return paginateQuery({
        pagination: input.pagination,
        ctx,
        responseItemSchema: UserResourceUsageLogSchema.omit({ text: true }),
        handle: async ({ skip, take, ctx }) => {
          const result = await ctx.db.userResourceUsageLog.findMany({
            where: { userId },
            skip,
            take,
          });
          const total = await ctx.db.userResourceUsageLog.count({
            where: { userId },
          });
          return { result, total };
        },
      });
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
      if (ctx.user.role !== UserRole.ADMIN && ctx.user.id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access this data" });
      }
      return sumLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
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
      return sumLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        instanceId: input.instanceId,
      });
    }),

  sumLogsInDurationWindowsGlobal: protectedProcedure
    .input(
      z.object({
        unit: ResourceUnitSchema,
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return sumLogsInDurationWindows({ ctx, durationWindows: input.durationWindows });
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
      });
    }),
});
