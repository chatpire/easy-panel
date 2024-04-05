import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure, protectedProcedure, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import {
  ServiceInstanceCreateSchema,
  ServiceInstanceSchema,
  ServiceInstanceUpdateSchema,
} from "@/schema/serviceInstance.schema";
import { serviceInstances, userInstanceTokens, users } from "@/server/db/schema";
import { createCUID } from "@/lib/cuid";
import { and, eq } from "drizzle-orm";

export const serviceInstanceRouter = createTRPCRouter({
  create: adminProcedure.input(ServiceInstanceCreateSchema).mutation(async ({ ctx, input }) => {
    const result = await ctx.db
      .insert(serviceInstances)
      .values({
        id: createCUID(),
        ...input,
      })
      .returning();
    return ServiceInstanceSchema.parse(result[0]);
  }),

  grantToAllActiveUsers: adminProcedure.input(z.object({ instanceId: z.string() })).mutation(async ({ ctx, input }) => {
    const userIds = await ctx.db.select({ id: users.id }).from(users).where(eq(users.isActive, true));
    await ctx.db.transaction(async (tx) => {
      for (const { id } of userIds) {
        await tx.insert(userInstanceTokens).values({
          userId: id,
          instanceId: input.instanceId,
          token: createCUID(),
        }).onConflictDoNothing();
      }
    });
  }),

  update: adminProcedure.input(ServiceInstanceUpdateSchema).mutation(async ({ ctx, input }) => {
    if (!input.id) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "ID is required" });
    }
    const result = await ctx.db
      .update(serviceInstances)
      .set(input)
      .where(eq(serviceInstances.id, input.id))
      .returning();
    return ServiceInstanceSchema.parse(result);
  }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const result = await ctx.db.query.serviceInstances.findMany();
    return ServiceInstanceSchema.array().parse(result);
  }),

  delete: adminProcedure.input(ServiceInstanceSchema.pick({ id: true })).mutation(async ({ ctx, input }) => {
    await ctx.db.delete(serviceInstances).where(eq(serviceInstances.id, input.id));
  }),

  verifyToken: publicProcedure
    .input(
      z.object({
        instanceId: z.string(),
        userToken: z.string(),
        requestIp: z.string().ip().nullable(),
        userIp: z.string().ip().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const instanceToken = await ctx.db.query.userInstanceTokens.findFirst({
        where: and(eq(userInstanceTokens.instanceId, input.instanceId), eq(userInstanceTokens.token, input.userToken)),
      });
      if (!instanceToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
      }
      if (instanceToken.instanceId !== input.instanceId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid instanceId" });
      }
      return instanceToken.userId;
    }),
});
