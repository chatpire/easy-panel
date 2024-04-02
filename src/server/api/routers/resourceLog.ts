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
import { type ResourceLogSumResults } from "@/schema/resourceLog.schema";
import { paginateQuery } from "../pagination";

const sumLogsInDurationWindows = async ({
  ctx,
  durationWindows,
  userId,
  instanceId,
}: {
  ctx: TRPCContext;
  durationWindows: DurationWindow[];
  userId?: string;
  instanceId?: string;
}): Promise<ResourceLogSumResults> => {
  const results = [] as ResourceLogSumResults;

  for (const durationWindow of durationWindows) {
    const durationWindowSeconds = DURATION_WINDOWS[durationWindow as keyof typeof DURATION_WINDOWS];
    const aggResult = await ctx.db.userResourceUsageLog.aggregate({
      where: {
        timestamp: {
          gte: new Date(new Date().getTime() - durationWindowSeconds * 1000),
        },
        userId,
        instanceId,
      },
      _sum: { utf8Length: true, tokensLength: true },
      _count: true,
    });
    results.push({
      durationWindow,
      utf8LengthSum: aggResult._sum?.utf8Length,
      tokensLengthSum: aggResult._sum?.tokensLength,
      count: aggResult._count,
    });
  }

  return results;
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
});
