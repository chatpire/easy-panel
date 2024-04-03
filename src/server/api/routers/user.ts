import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, adminProcedure, protectedWithUserProcedure } from "@/server/trpc";
import {
  UserReadAdminSchema,
  UserReadSchema,
  UserUpdateSelfSchema,
  UserUpdatePasswordSchema,
} from "@/schema/user.schema";
import { hashPassword } from "@/lib/password";
import { type PrismaClient, UserRole } from "@prisma/client";
import {
  UserInstanceTokenSchema,
  UserOptionalDefaultsSchema,
  UserWhereUniqueInputSchema,
} from "@/schema/generated/zod";
import { generateId } from "lucia";
import { writeUserCreateEventLog } from "@/server/actions/write-log";

export const UserCreateSchema = UserOptionalDefaultsSchema.omit({
  hashedPassword: true,
  createdAt: true,
  updatedAt: true,
}).merge(
  z.object({
    password: z.string().min(6).optional(),
  }),
);

export async function createUser(db: PrismaClient, input: z.infer<typeof UserCreateSchema>, instanceIds: string[], by: "admin" | "oidc") {
  const user = await db.user.create({
    data: {
      ...input,
      hashedPassword: input.password ? await hashPassword(input.password) : undefined,
      userInstanceTokens: {
        create: instanceIds.map((instanceId) => ({
          instanceId,
          token: input.username + "__" + generateId(16),
        })),
      },
    },
    include: {
      userInstanceTokens: true,
    },
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

  getUnique: adminProcedure.input(UserWhereUniqueInputSchema).query(async ({ ctx, input }) => {
    const user = await ctx.db.user.findFirst({ where: input });
    if (!user) {
      throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
    }
    return UserReadAdminSchema.parse(user);
  }),

  updateSelf: protectedWithUserProcedure.input(UserUpdateSelfSchema).mutation(async ({ ctx, input }) => {
    const user = ctx.user;
    const result = await ctx.db.user.update({
      where: {
        id: user.id,
      },
      data: {
        ...input,
      },
    });
    return UserReadSchema.parse(result);
  }),

  changePassword: protectedWithUserProcedure.input(UserUpdatePasswordSchema).mutation(async ({ ctx, input }) => {
    const hashedPassword = await hashPassword(input.password);

    if (ctx.user.role !== UserRole.ADMIN && input.id !== ctx.user.id) {
      throw new TRPCError({ code: "FORBIDDEN", message: "You can only change your own password" });
    }

    await ctx.db.user.update({
      where: {
        id: input.id,
      },
      data: {
        hashedPassword,
      },
    });
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const users = await ctx.db.user.findMany({});
    return users.map((user) => UserReadAdminSchema.parse(user));
  }),

  generateToken: protectedWithUserProcedure
    .input(
      z.object({
        instanceId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.user;
      const instance = await ctx.db.serviceInstance.findUnique({ where: { id: input.instanceId } });
      if (!instance) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Instance not found" });
      }

      const existingToken = await ctx.db.userInstanceToken.findFirst({
        where: {
          userId: user.id,
          instanceId: instance.id,
        },
      });
      if (existingToken) {
        throw new TRPCError({ code: "CONFLICT", message: "Token already exists" });
      }

      const token = await ctx.db.userInstanceToken.create({
        data: {
          user: { connect: { id: user.id } },
          instance: { connect: { id: instance.id } },
          token: user.username + "__" + generateId(16),
        },
      });

      return UserInstanceTokenSchema.parse(token);
    }),

  getInstanceToken: protectedWithUserProcedure
    .input(z.object({ instanceId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ctx.user;
      const token = await ctx.db.userInstanceToken.findFirst({
        where: {
          userId: user.id,
          instanceId: input.instanceId,
        },
      });
      if (!token) {
        return null;
      }
      return UserInstanceTokenSchema.parse(token);
    }),
});
