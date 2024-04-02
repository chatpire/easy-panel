import { createTRPCRouter, adminProcedure, protectedWithUserProcedure } from "@/server/trpc";
import { UserEventLogSchema, UserEventLogWhereInputSchema } from "@/schema/generated/zod";
import { PaginationInputSchema } from "@/schema/pagination.schema";
import { z } from "zod";
import { paginateQuery } from "../pagination";
import { UserRole } from "@prisma/client";
import { TRPCError } from "@trpc/server";

export const eventLogRouter = createTRPCRouter({
  getMany: adminProcedure
    .input(
      z.object({
        where: UserEventLogWhereInputSchema,
        pagination: PaginationInputSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      return paginateQuery({
        pagination: input.pagination,
        ctx,
        responseItemSchema: UserEventLogSchema,
        handle: async ({ skip, take, ctx }) => {
          const result = await ctx.db.userEventLog.findMany({
            where: input.where,
            skip,
            take,
          });
          const total = await ctx.db.userEventLog.count({
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
        responseItemSchema: UserEventLogSchema,
        handle: async ({ skip, take, ctx }) => {
          const result = await ctx.db.userEventLog.findMany({
            where: { userId },
            skip,
            take,
          });
          const total = await ctx.db.userEventLog.count({
            where: { userId },
          });
          return { result, total };
        },
      });
    }),
});
