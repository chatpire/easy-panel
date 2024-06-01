import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure, protectedProcedure, protectedWithUserProcedure } from "@/server/trpc";
import { z } from "zod";
import {
  ServiceInstanceCreateSchema,
  ServiceInstanceAdminSchema,
  ServiceInstanceUpdateSchema,
  ServiceInstanceWithToken,
  ServiceInstanceUserReadSchema,
} from "@/schema/serviceInstance.schema";
import { resourceUsageLogs, serviceInstances, userInstanceAbilities } from "@/server/db/schema";
import { createCUID } from "@/lib/cuid";
import { and, eq } from "drizzle-orm";
import {
  PoekmonSharedAccountInfoUserReadableSchema,
  PoekmonSharedInstanceData,
} from "@/schema/service/poekmon-shared.schema";

export const serviceInstanceRouter = createTRPCRouter({
  create: adminProcedure.input(ServiceInstanceCreateSchema).mutation(async ({ ctx, input }) => {
    const result = await ctx.db
      .insert(serviceInstances)
      .values({
        id: createCUID(),
        ...input,
      })
      .returning();
    return ServiceInstanceAdminSchema.parse(result[0]);
  }),

  update: adminProcedure.input(ServiceInstanceUpdateSchema).mutation(async ({ ctx, input }) => {
    if (!input.id) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "ID is required" });
    }
    const result = await ctx.db
      .update(serviceInstances)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(serviceInstances.id, input.id))
      .returning();
    return ServiceInstanceAdminSchema.parse(result[0]);
  }),

  updateData: adminProcedure
    .input(ServiceInstanceUpdateSchema.pick({ id: true, data: true }))
    .mutation(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "ID is required" });
      }
      const result = await ctx.db
        .update(serviceInstances)
        .set({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: input.data,
          updatedAt: new Date(),
        })
        .where(eq(serviceInstances.id, input.id))
        .returning();
      return ServiceInstanceAdminSchema.parse(result[0]);
    }),

  getAllAdmin: adminProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.serviceInstances.findMany();
    return ServiceInstanceAdminSchema.array().parse(result);
  }),

  getAllWithToken: protectedWithUserProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    const result = await ctx.db
      .select({
        serviceInstances,
        token: userInstanceAbilities.token,
      })
      .from(serviceInstances)
      .innerJoin(
        userInstanceAbilities,
        and(
          eq(userInstanceAbilities.instanceId, serviceInstances.id),
          eq(userInstanceAbilities.userId, user.id),
          eq(userInstanceAbilities.canUse, true),
        ),
      );
    const instances = result.map((r) => ({
      ...r.serviceInstances,
      token: r.token,
    }));
    return ServiceInstanceWithToken.array().parse(instances);
  }),

  getByIdAdmin: protectedProcedure
    .input(ServiceInstanceUserReadSchema.pick({ id: true }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.serviceInstances.findFirst({
        where: eq(serviceInstances.id, input.id),
      });
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Service instance not found" });
      }
      return ServiceInstanceAdminSchema.parse(result);
    }),

  getById: protectedProcedure.input(ServiceInstanceUserReadSchema.pick({ id: true })).query(async ({ ctx, input }) => {
    const result = await ctx.db.query.serviceInstances.findFirst({
      where: eq(serviceInstances.id, input.id),
    });
    if (!result) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Service instance not found" });
    }
    return ServiceInstanceUserReadSchema.parse(result);
  }),

  getPoekmonSharedAccountInfo: protectedProcedure
    .input(ServiceInstanceUserReadSchema.pick({ id: true }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.serviceInstances.findFirst({
        where: eq(serviceInstances.id, input.id),
      });
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Service instance not found" });
      }
      if (result.type !== "POEKMON_SHARED") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid instance type" });
      }
      const data = result.data as PoekmonSharedInstanceData;
      if (!data.poe_account.account_info) {
        return null;
      }
      return PoekmonSharedAccountInfoUserReadableSchema.parse(data.poe_account.account_info);
    }),

  delete: adminProcedure
    .input(ServiceInstanceAdminSchema.pick({ id: true }).merge(z.object({ deleteLogs: z.boolean() })))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.transaction(async (tx) => {
        await tx.delete(userInstanceAbilities).where(eq(userInstanceAbilities.instanceId, input.id));
        await tx.delete(serviceInstances).where(eq(serviceInstances.id, input.id));
        if (input.deleteLogs) {
          await tx.delete(resourceUsageLogs).where(eq(resourceUsageLogs.instanceId, input.id));
        }
      });
    }),
});
