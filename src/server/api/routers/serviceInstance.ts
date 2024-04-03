import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure, protectedProcedure, publicProcedure } from "@/server/trpc";
import { ServiceInstanceOptionalDefaultsSchema, ServiceInstanceSchema } from "@/schema/generated/zod";
import { z } from "zod";
import { generateId } from "lucia";

export const serviceInstanceRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      ServiceInstanceOptionalDefaultsSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      }).merge(
        z.object({
          description: z.string().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.serviceInstance.create({
        data: input,
      });
      return ServiceInstanceSchema.parse(result);
    }),

  grantToUsers: adminProcedure
    .input(
      z.object({
        instanceId: z.string(),
        userIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.userIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "User IDs are required" });
      }
      const result = await ctx.db.serviceInstance.update({
        where: { id: input.instanceId },
        data: {
          userInstanceTokens: {
            create: input.userIds.map((userId) => ({
              token: userId + "__" + generateId(16),
              user: { connect: { id: userId } },
            })),
          },
        },
        include: { userInstanceTokens: true },
      });
      return ServiceInstanceSchema.parse(result);
    }),

  grantToAllActiveUsers: adminProcedure.input(z.object({ instanceId: z.string() })).mutation(async ({ ctx, input }) => {
    const users = await ctx.db.user.findMany({
      where: {
        isActive: true,
      },
    });
    const result = await ctx.db.serviceInstance.update({
      where: { id: input.instanceId },
      data: {
        userInstanceTokens: {
          create: users.map((user) => ({
            token: user.id + "__" + generateId(16),
            user: { connect: { id: user.id } },
          })),
        },
      },
      include: { userInstanceTokens: true },
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
      const instanceToken = await ctx.db.userInstanceToken.findUnique({
        where: {
          token: input.userToken,
        },
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
