import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure, protectedProcedure } from "@/server/trpc";
import { ServiceInstanceOptionalDefaultsSchema, ServiceInstanceSchema } from "@/schema/generated/zod";

export const serviceInstanceRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      ServiceInstanceOptionalDefaultsSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.serviceInstance.create({
        data: input,
      });
      return ServiceInstanceSchema.parse(result);
    }),

  update: adminProcedure.input(ServiceInstanceOptionalDefaultsSchema).mutation(async ({ ctx, input }) => {
    if (!input.id) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "ID is required" });
    }
    const result = await ctx.db.user.update({
      where: { id: input.id },
      data: input,
    });
    return ServiceInstanceSchema.parse(result);
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.serviceInstance.findMany();
    return ServiceInstanceSchema.array().parse(result);
  }),

  delete: adminProcedure.input(ServiceInstanceSchema.pick({ id: true })).mutation(async ({ ctx, input }) => {
    const result = await ctx.db.serviceInstance.delete({
      where: { id: input.id },
    });
    return ServiceInstanceSchema.parse(result);
  }),
});
