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
import { getPaginatedDataSchema, PaginationInputSchema } from "@/schema/pagination.schema";
import { computeSkip } from "@/lib/utils";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { type ResourceUnit, UserRole } from "@prisma/client";
import { DURATION_WINDOWS, DurationWindowSchema } from "@/schema/definition.schema";
import { type ResourceLogSumResults } from "@/schema/resourceLog.schema";

const sumLogsInDurationWindows = async ({
  ctx,
  unit,
  durationWindows,
  userId,
  instanceId,
}: {
  ctx: TRPCContext;
  unit: ResourceUnit;
  durationWindows: DurationWindow[];
  userId?: string;
  instanceId?: string;
}): Promise<ResourceLogSumResults> => {
  const results = [] as ResourceLogSumResults;

  for (const durationWindow of durationWindows) {
    const durationWindowSeconds = DURATION_WINDOWS[durationWindow as keyof typeof DURATION_WINDOWS];
    const aggResult = await ctx.db.userResourceUsageLog.aggregate({
      where: {
        unit,
        timestamp: {
          gte: new Date(new Date().getTime() - durationWindowSeconds * 1000),
        },
        userId,
        instanceId,
      },
      _sum: { amount: true },
      _count: true,
    });
    results.push({
      unit,
      durationWindow,
      value: aggResult._sum?.amount ?? 0,
      count: aggResult._count ?? 0,
    });
  }

  return results;
};

export const resourceLogRouter = createTRPCRouter({
  getMany: adminProcedure.input(UserResourceUsageLogWhereInputSchema).query(async ({ input, ctx }) => {
    const result = await ctx.db.userResourceUsageLog.findMany({
      where: input,
    });
    return UserResourceUsageLogSchema.array().parse(result);
  }),

  getAllByUser: protectedWithUserProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        pagination: PaginationInputSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId, pagination } = input;
      if (ctx.user.role !== UserRole.ADMIN && ctx.user.id !== userId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access this data" });
      }
      const result = await ctx.db.userResourceUsageLog.findMany({
        where: {
          userId,
        },
        skip: computeSkip(pagination),
        take: pagination.pageSize,
      });
      const total = await ctx.db.userResourceUsageLog.count({
        where: {
          userId,
        },
      });
      const totalPages = Math.ceil(total / pagination.pageSize);
      return getPaginatedDataSchema(UserResourceUsageLogSchema).parse({
        data: result,
        pagination: {
          total,
          currentPage: pagination.currentPage,
          totalPages,
          nextPage: pagination.currentPage + 1 <= totalPages ? pagination.currentPage + 1 : null,
          prevPage: pagination.currentPage - 1 > 0 ? pagination.currentPage - 1 : null,
        },
      });
    }),

  sumLogsInDurationWindowsByUserId: protectedWithUserProcedure
    .input(
      z.object({
        userId: z.string().optional(),
        unit: ResourceUnitSchema,
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
        unit: input.unit,
        durationWindows: input.durationWindows,
        userId,
      });
    }),

  sumLogsInDurationWindowsByInstance: protectedProcedure
    .input(
      z.object({
        instanceId: z.string(),
        unit: ResourceUnitSchema,
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      // TODO: Check if the user has access to the instance
      return sumLogsInDurationWindows({
        ctx,
        unit: input.unit,
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
      return sumLogsInDurationWindows({ ctx, unit: input.unit, durationWindows: input.durationWindows });
    }),
});
