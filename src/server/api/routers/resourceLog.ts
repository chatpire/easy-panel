import { createTRPCRouter, protectedWithUserProcedure, type TRPCContext, protectedProcedure } from "@/server/trpc";
import { PaginationInputSchema } from "@/schema/pagination.schema";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { ResourceUsageLogWhereInputSchema, ResourceUsageLogSchema } from "@/schema/resourceLog.schema";
import { paginateQuery } from "../pagination";
import { type SQL, and, count, eq, gte, lte, desc, getTableColumns } from "drizzle-orm";
import { resourceUsageLogs, serviceInstances, users } from "@/server/db/schema";
import { UserRoles } from "@/schema/user.schema";
import { DurationWindowSchema } from "@/server/db/enum";
import { alignTimeToGranularity } from "@/lib/utils";
import {
  groupGPT4LogsInDurationWindow,
  groupPoekmonAPILogsInDurationWindowByModel,
  sumChatGPTSharedLogsInDurationWindows,
  sumPoekmonAPILogsInDurationWindows,
  sumPoekmonSharedLogsInDurationWindows,
} from "./resourceLogHelper";

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
      if (where.type) {
        andParams.push(eq(resourceUsageLogs.type, where.type));
      }
      const filter = and(...andParams);
      const { total, result } = await ctx.db.transaction(async (tx) => {
        const total = await tx
          .select({
            value: count(),
          })
          .from(resourceUsageLogs)
          .where(and(...andParams))
          .leftJoin(users, eq(resourceUsageLogs.userId, users.id));
        const result = await tx
          .select({
            ...getTableColumns(resourceUsageLogs),
            user: {
              username: users.username,
              name: users.name,
            },
            instance: {
              name: serviceInstances.name,
              url: serviceInstances.url,
            },
          })
          .from(resourceUsageLogs)
          .where(filter)
          .leftJoin(users, eq(resourceUsageLogs.userId, users.id))
          .leftJoin(serviceInstances, eq(resourceUsageLogs.instanceId, serviceInstances.id))
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

  sumChatGPTSharedLogsInDurationWindowsByUserId: protectedWithUserProcedure
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

  sumChatGPTSharedLogsInDurationWindowsByInstance: protectedProcedure
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

  groupChatGPTSharedGPT4LogsInDurationWindowByInstance: protectedProcedure
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

  sumPoekmonAPIResourceLogsInDurationWindowsByInstance: protectedProcedure
    .input(
      z.object({
        instanceId: z.string(),
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return sumPoekmonAPILogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        timeEnd: alignTimeToGranularity(60),
        instanceId: input.instanceId,
      });
    }),

  groupPoekmonAPIResourceLogsInDurationWindowByModel: protectedProcedure
    .input(
      z.object({
        instanceId: z.string(),
        durationWindow: DurationWindowSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      return groupPoekmonAPILogsInDurationWindowByModel({
        ctx,
        durationWindow: input.durationWindow,
        instanceId: input.instanceId,
        timeEnd: alignTimeToGranularity(60),
      });
    }),

  sumPoekmonSharedResourceLogsInDurationWindowsByInstance: protectedProcedure
    .input(
      z.object({
        instanceId: z.string(),
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      return sumPoekmonSharedLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        timeEnd: alignTimeToGranularity(60),
        instanceId: input.instanceId,
      });
    }),

  sumPoekmonSharedLogsInDurationWindowsByUserId: protectedWithUserProcedure
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
      return sumPoekmonSharedLogsInDurationWindows({
        ctx,
        durationWindows: input.durationWindows,
        timeEnd: alignTimeToGranularity(60),
        userId,
      });
    }),
});
