import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/trpc";
import { UserLoginFormSchema } from "@/schema/user.schema";
import { verifyPassword } from "@/lib/password";
import { lucia } from "@/server/lucia";
import { cookies } from "next/headers";
import { env } from "@/env";
import { writeUserLoginEventLog } from "@/server/actions/write-event-log";
import { eq } from "drizzle-orm";
import { users } from "@/server/db/schema";

export const authRouter = createTRPCRouter({
  loginByPassword: publicProcedure.input(UserLoginFormSchema).mutation(async ({ ctx, input }) => {
    if (env.ENABLE_PASSWORD_LOGIN === false) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Password login is disabled" });
    }
    const user = await ctx.db.query.users.findFirst({ where: eq(users.username, input.username) });
    if (!user) {
      // Hash the password to prevent timing attacks
      // const _ = hashPassword(password);
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Wrong username or password" });
    }
    if (!user.hashedPassword) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Wrong username or password" });
    }
    const validPassword = await verifyPassword(input.password, user.hashedPassword);
    if (!validPassword) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "Wrong username or password" });
    }

    await writeUserLoginEventLog(ctx.db, user.id, "success", "password");

    const session = await lucia.createSession(user.id, {
      currentIp: undefined, // todo
    });
    const sessionCookie = lucia.createSessionCookie(session.id);
    cookies().set(sessionCookie);
  }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const session = ctx.session;
    await lucia.invalidateSession(session.id);
    cookies().delete(lucia.sessionCookieName);
  }),
});
