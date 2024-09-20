import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure, publicProcedure, protectedProcedure } from "@/server/trpc";
import { z } from "zod";
import { serviceInstances, userInstanceAbilities, users } from "@/server/db/schema";
import { type SQL, and, eq, inArray } from "drizzle-orm";
import { generateId } from "lucia";
import { UserInstanceAbilitySchema, type UserInstanceData } from "@/schema/userInstanceAbility.schema";
import { type ServiceType, ServiceTypeSchema } from "@/server/db/enum";
import { type Db } from "@/server/db";
import { type APIShareInstanceData, type APIShareUserInstanceData } from "@/schema/service/api-share.schema";
import { ServiceInstanceUserReadSchema } from "@/schema/serviceInstance.schema";
import { filterUserAvailableModels } from "../helpers/api-share";

function createDefaultInstanceData(type: ServiceType): UserInstanceData | null {
  switch (type) {
    case ServiceTypeSchema.Values.POEKMON_SHARED:
      return {
        type,
        chat_ids: [],
        chat_codes: [],
        bot_ids: [],
        available_points: -1,
      };
    case ServiceTypeSchema.Values.API_SHARE:
      return {
        type,
        tag_whitelist: [],
      };
    default:
      return null;
  }
}

async function batchCreateAbilities(
  db: Db,
  userIds: string[],
  instanceIds: string[],
  updateCanUse = false,
  resetData = false,
) {
  await db.transaction(async (tx) => {
    const instances = await tx.query.serviceInstances.findMany({
      where: inArray(serviceInstances.id, instanceIds),
    });
    if (instances.length !== instanceIds.length) {
      const missingIds = instanceIds.filter((id) => !instances.some((instance) => instance.id === id));
      throw new TRPCError({ code: "NOT_FOUND", message: "Some Instance not found: " + String(missingIds) });
    }
    for (const instance of instances) {
      const data = createDefaultInstanceData(instance.type);
      for (const userId of userIds) {
        const existingAbility = await tx.query.userInstanceAbilities.findFirst({
          where: and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, instance.id)),
        });
        if (!existingAbility) {
          await tx
            .insert(userInstanceAbilities)
            .values({
              userId,
              instanceId: instance.id,
              token: generateId(24),
              canUse: true,
              data,
            })
            .onConflictDoNothing();
        } else {
          if (existingAbility.data === null || existingAbility?.data === undefined || resetData) {
            await tx
              .update(userInstanceAbilities)
              .set({
                data,
                updatedAt: new Date(),
              })
              .where(and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, instance.id)));
          }
          if (updateCanUse && existingAbility.canUse === false) {
            await tx
              .update(userInstanceAbilities)
              .set({
                canUse: true,
                updatedAt: new Date(),
              })
              .where(and(eq(userInstanceAbilities.userId, userId), eq(userInstanceAbilities.instanceId, instance.id)));
          }
        }
        
      }
    }
  });
}

export const userInstanceAbilityRouter = createTRPCRouter({
  getMany: adminProcedure
    .input(z.object({ userId: z.string().optional(), instanceId: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const andParams = [] as SQL[];
      if (input.userId) {
        andParams.push(eq(userInstanceAbilities.userId, input.userId));
      }
      if (input.instanceId) {
        andParams.push(eq(userInstanceAbilities.instanceId, input.instanceId));
      }
      const abilities = await ctx.db
        .select()
        .from(userInstanceAbilities)
        .where(and(...andParams));
      return UserInstanceAbilitySchema.array().parse(abilities);
    }),

  grantInstancesToUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        instanceIds: z.string().array(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, instanceIds: instanceIdCanUse } = input;

      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await batchCreateAbilities(ctx.db, [userId], instanceIdCanUse, true);
    }),

  grantInstanceToAllActiveUsers: adminProcedure
    .input(z.object({ instanceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userIds = await ctx.db.select({ id: users.id }).from(users).where(eq(users.isActive, true));

      await batchCreateAbilities(
        ctx.db,
        userIds.map((user) => user.id),
        [input.instanceId],
        true,
      );
    }),

  resetInstanceDataToAllActiveUsers: adminProcedure
    .input(z.object({ instanceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userIds = await ctx.db.select({ id: users.id }).from(users).where(eq(users.isActive, true));

      await batchCreateAbilities(
        ctx.db,
        userIds.map((user) => user.id),
        [input.instanceId],
        true,
        true,
      );
    }),

  unpublishToAllActiveUsers: adminProcedure
    .input(z.object({ instanceId: z.string(), delete: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      const userAbilities = await ctx.db
        .select()
        .from(userInstanceAbilities)
        .where(and(eq(userInstanceAbilities.instanceId, input.instanceId)));

      for (const ability of userAbilities) {
        if (input.delete) {
          await ctx.db
            .delete(userInstanceAbilities)
            .where(
              and(
                eq(userInstanceAbilities.instanceId, input.instanceId),
                eq(userInstanceAbilities.userId, ability.userId),
              ),
            );
        } else {
          await ctx.db
            .update(userInstanceAbilities)
            .set({ canUse: false })
            .where(
              and(
                eq(userInstanceAbilities.instanceId, input.instanceId),
                eq(userInstanceAbilities.userId, ability.userId),
              ),
            );
        }
      }
    }),

  verifyUserAbility: publicProcedure
    .input(
      z.object({
        instanceId: z.string(),
        userToken: z.string(),
        requestIp: z.string().ip().nullable(),
        userIp: z.string().ip().nullable(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const instanceToken = await ctx.db.query.userInstanceAbilities.findFirst({
        where: and(
          eq(userInstanceAbilities.instanceId, input.instanceId),
          eq(userInstanceAbilities.token, input.userToken),
        ),
      });
      if (!instanceToken) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
      }
      if (instanceToken.instanceId !== input.instanceId) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid instanceId" });
      }
      if (instanceToken.canUse === false) {
        throw new TRPCError({ code: "FORBIDDEN", message: "You are not permitted to use this instance" });
      }
      return instanceToken.userId;
    }),

  getAPIShareAvailableModels: protectedProcedure
    .input(ServiceInstanceUserReadSchema.pick({ id: true }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.serviceInstances.findFirst({
        where: eq(serviceInstances.id, input.id),
      });
      if (!result) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Service instance not found" });
      }
      if (result.type !== "API_SHARE") {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Invalid instance type" });
      }
      const instanceData = result.data as APIShareInstanceData;
      const userInstance = await ctx.db.query.userInstanceAbilities.findFirst({
        where: and(
          eq(userInstanceAbilities.instanceId, input.id),
          eq(userInstanceAbilities.userId, ctx.session.userId),
        ),
      });
      if (!userInstance) {
        throw new TRPCError({ code: "FORBIDDEN", message: "User does not have access to this instance" });
      }
      const models = filterUserAvailableModels(instanceData, userInstance.data as APIShareUserInstanceData);
      return models;
    }),
});
