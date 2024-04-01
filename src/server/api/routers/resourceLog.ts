import { createTRPCRouter, adminProcedure, protectedWithUserProcedure } from "@/server/trpc";
import {
  ResourceUnitSchema,
  UserResourceUsageLogSchema,
  UserResourceUsageLogWhereInputSchema,
} from "@/schema/generated/zod";
import { getPaginatedDataSchema, PaginationInputSchema } from "@/schema/pagination.schema";
import { computeSkip } from "@/lib/utils";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { UserRole } from "@prisma/client";
import { DurationWindowSchema } from "@/schema/definition.schema";
import { type ResourceLogSumResults } from "@/schema/resourceLog.schema";

export const resourceLogRouter = createTRPCRouter({
  getMany: adminProcedure.input(UserResourceUsageLogWhereInputSchema).query(async ({ input, ctx }) => {
    const result = await ctx.db.userResourceUsageLog.findMany({
      where: input,
    });
    return UserResourceUsageLogSchema.array().parse(result);
  }),

  getAllByUser: protectedWithUserProcedure.input(z.object({
    userId: z.string().optional(),
    pagination: PaginationInputSchema,
  })).query(async ({ input, ctx }) => {
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
        userId
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

  sumLogsInDurationWindows: protectedWithUserProcedure
    .input(
      z.object({
        id: z.string().optional(),
        unit: ResourceUnitSchema,
        durationWindows: DurationWindowSchema.array(),
      }),
    )
    .query(async ({ input, ctx }) => {
      if (input.id && ctx.user.role !== UserRole.ADMIN && ctx.user.id !== input.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not allowed to access this data" });
      }
      const results = [] as ResourceLogSumResults;

      for (const durationWindow of input.durationWindows) {
        const aggResult = await ctx.db.userResourceUsageLog.aggregate({
          where: {
            userId: input.id,
            unit: input.unit,
            timestamp: {
              gte: new Date(new Date().getTime() - durationWindow * 1000),
            },
          },
          _sum: { amount: true },
        });
        results.push({
          unit: input.unit,
          durationWindow,
          value: aggResult._sum?.amount ?? 0,
        });
      }

      return results;
    }),
});
