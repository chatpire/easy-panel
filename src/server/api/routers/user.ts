import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure, protectedWithUserProcedure } from "@/server/trpc";
import {
  UserReadAdminSchema,
  UserReadSchema,
  UserUpdateSelfSchema,
  UserUpdatePasswordSchema,
  UserCreateSchema,
  UserRoles,
} from "@/schema/user.schema";
import { hashPassword } from "@/lib/password";
import { writeUserCreateEventLog } from "@/server/actions/write-event-log";
import { Db } from "@/server/db";
import { userInstanceTokens, users } from "@/server/db/schema";
import { eq, sql } from "drizzle-orm";
import { UserInstanceTokenSchema } from "@/schema/userInstanceToken.schema";
import { createCUID } from "@/lib/cuid";
import { generateId } from "lucia";
import { UserCreateEventContentCreatedBy } from "@/schema/definition.schema";

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
      await tx.insert(userInstanceTokens).values({
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

  updateSelf: protectedWithUserProcedure.input(UserUpdateSelfSchema).mutation(async ({ ctx, input }) => {
    const user = ctx.user;
    const result = await ctx.db.update(users).set(input).where(eq(users.id, user.id)).returning();
    return UserReadSchema.parse(result);
  }),

  changePassword: protectedWithUserProcedure.input(UserUpdatePasswordSchema).mutation(async ({ ctx, input }) => {
    const hashedPassword = await hashPassword(input.password);

    if (ctx.user.role !== UserRoles.ADMIN && input.id !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only change your own password" });
    }

    await ctx.db.update(users).set({ hashedPassword }).where(eq(users.id, input.id));
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const results = await ctx.db.query.users.findMany();
    return UserReadAdminSchema.array().parse(results);
  }),

  generateToken: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        instanceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, instanceId } = input;

      const user = await ctx.db.query.users.findFirst({ where: eq(users.id, userId) });
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      const token = await ctx.db
        .insert(userInstanceTokens)
        .values({
          userId,
          instanceId,
          token: user.username + "__" + generateId(16),
        })
        .returning();

      return UserInstanceTokenSchema.parse(token[0]);
    }),

  getInstanceToken: protectedWithUserProcedure
    .input(z.object({ instanceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      const token = await ctx.db.query.userInstanceTokens.findFirst({
        where: sql`"userId" = ${user.id} AND "instanceId" = ${input.instanceId}`,
      });
      if (!token) {
        return null;
      }
      return UserInstanceTokenSchema.parse(token);
    }),
});
