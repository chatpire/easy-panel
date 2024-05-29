import { TRPCError } from "@trpc/server";

import { createTRPCRouter, adminProcedure, publicProcedure } from "@/server/trpc";
import { z } from "zod";
import { userInstanceAbilities, users } from "@/server/db/schema";
import { createCUID } from "@/lib/cuid";
import { type SQL, and, eq } from "drizzle-orm";
import { generateId } from "lucia";
import { UserInstanceAbilitySchema } from "@/schema/userInstanceAbility.schema";

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
        instanceIdCanUse: z.record(z.boolean()),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, instanceIdCanUse } = input;

      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      await ctx.db.transaction(async (tx) => {
        for (const [instanceId, canUse] of Object.entries(instanceIdCanUse)) {
          // todo create default data
          await tx
            .insert(userInstanceAbilities)
            .values({
              userId,
              instanceId,
              token: user.username + "__" + generateId(16),
              canUse,
            })
            .onConflictDoUpdate({
              target: [userInstanceAbilities.userId, userInstanceAbilities.instanceId],
              set: {
                canUse,
                updatedAt: new Date(),
              },
            });
        }
      });
    }),

  grantInstanceToAllActiveUsers: adminProcedure
    .input(z.object({ instanceId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const userIds = await ctx.db.select({ id: users.id }).from(users).where(eq(users.isActive, true));
      await ctx.db.transaction(async (tx) => {
        for (const { id } of userIds) {
          await tx
            .insert(userInstanceAbilities)
            .values({
              userId: id,
              instanceId: input.instanceId,
              token: createCUID(),
              canUse: true,
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: [userInstanceAbilities.userId, userInstanceAbilities.instanceId],
              set: {
                canUse: true,
                updatedAt: new Date(),
              },
            });
        }
      });
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
});
