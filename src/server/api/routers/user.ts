import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure, protectedWithUserProcedure, adminWithUserProcedure } from "@/server/trpc";
import {
  UserReadAdminSchema,
  UserReadSchema,
  UserUpdateSelfSchema,
  UserUpdatePasswordSchema,
  UserCreateSchema,
  UserRoles,
  UserUpdateAdminSchema,
} from "@/schema/user.schema";
import { hashPassword } from "@/lib/password";
import { writeUserCreateEventLog } from "@/server/actions/write-event-log";
import { type Db } from "@/server/db";
import { userInstanceAbilities, users } from "@/server/db/schema";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { UserInstanceAbilitySchema } from "@/schema/userInstanceToken.schema";
import { createCUID } from "@/lib/cuid";
import { generateId } from "lucia";
import { type UserCreateEventContentCreatedBy } from "@/schema/definition.schema";

export async function createUser(
  db: Db,
  input: z.infer<typeof UserCreateSchema>,
  instanceIds: string[],
  by: UserCreateEventContentCreatedBy,
) {
  const user = await db.transaction(async (tx) => {
    const createdResult = await tx
      .insert(users)
      .values({
        ...input,
        id: createCUID(),
        hashedPassword: input.password ? await hashPassword(input.password) : undefined,
      })
      .returning();
    const createdUser = createdResult[0]!;
    for (const instanceId of instanceIds) {
      await tx.insert(userInstanceAbilities).values({
        userId: createdUser.id,
        instanceId,
        token: createdUser.username + "__" + generateId(16),
      });
    }
    return createdUser;
  });

  await writeUserCreateEventLog(db, user, by);
  return user;
}

export const userRouter = createTRPCRouter({
  create: adminProcedure
    .input(
      z.object({
        user: UserCreateSchema,
        instanceIds: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await createUser(ctx.db, input.user, input.instanceIds, "admin");
      return UserReadAdminSchema.parse(user);
    }),

  getSelf: protectedWithUserProcedure.query(async ({ ctx }) => {
    const user = ctx.user;
    return UserReadSchema.parse(user);
  }),

  getById: adminWithUserProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const result = await ctx.db.query.users.findFirst({ where: eq(users.id, input.id) });
    if (!result) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return UserReadAdminSchema.parse(result);
  }),

  updateSelf: protectedWithUserProcedure.input(UserUpdateSelfSchema).mutation(async ({ ctx, input }) => {
    const user = ctx.user;
    const result = await ctx.db.update(users).set(input).where(eq(users.id, user.id)).returning();
    return UserReadSchema.parse(result);
  }),

  update: adminWithUserProcedure.input(UserUpdateAdminSchema).mutation(async ({ ctx, input }) => {
    if (input.id === ctx.user.id && input.isActive === false) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You cannot ban yourself" });
    }
    console.log("users.update", input);
    const hashedPassword = input.clearPassword ? null : input.password ? await hashPassword(input.password) : undefined;
    const result = await ctx.db
      .update(users)
      .set({
        ...input,
        hashedPassword,
      })
      .where(eq(users.id, input.id))
      .returning();
    return UserReadAdminSchema.parse(result[0]);
  }),

  delete: adminWithUserProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    if (input.id === ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You cannot delete yourself" });
    }
    await ctx.db.delete(users).where(eq(users.id, input.id));
  }),

  changePassword: protectedWithUserProcedure.input(UserUpdatePasswordSchema).mutation(async ({ ctx, input }) => {
    const hashedPassword = await hashPassword(input.password);

    if (ctx.user.role !== UserRoles.ADMIN && input.id !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only change your own password" });
    }

    await ctx.db.update(users).set({ hashedPassword }).where(eq(users.id, input.id));
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.select().from(users);
    return UserReadAdminSchema.array().parse(results);
  }),

  editInstanceAbilities: adminProcedure
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

  getInstanceAbilities: adminProcedure.input(z.object({ userId: z.string() })).query(async ({ ctx, input }) => {
    const abilities = await ctx.db.query.userInstanceAbilities.findMany({
      where: eq(userInstanceAbilities.userId, input.userId),
    });
    return UserInstanceAbilitySchema.array().parse(abilities);
  }),
});
