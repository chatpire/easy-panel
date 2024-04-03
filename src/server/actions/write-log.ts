import { type UserCreateEventContentSchema, type UserLoginEventContentSchema } from "@/schema/definition.schema";
import { UserEventLogSchema } from "@/schema/generated/zod";
import { type User, type PrismaClient, UserEventLog } from "@prisma/client";
import { headers } from "next/headers";
import { type z } from "zod";
import { ChatGPTSharedOAuthEventContentSchema } from "@/schema/service/chatgpt-shared.schema";

export async function writeUserLoginEventLog(
  db: PrismaClient,
  userId: string,
  resultType: "success" | "failure",
  method: "password" | "oidc",
) {
  return await db.userEventLog.create({
    data: {
      user: { connect: { id: userId } },
      type: "user.login",
      resultType,
      content: {
        type: "user.login",
        ip: headers().get("x-real-ip") ?? headers().get("x-forwarded-for"),
        method,
      } as z.infer<typeof UserLoginEventContentSchema>,
    },
  });
}

export async function writeUserCreateEventLog(db: PrismaClient, user: User, by: "admin" | "oidc") {
  return await db.userEventLog.create({
    data: {
      user: { connect: { id: user.id } },
      type: "user.create",
      resultType: "success",
      content: {
        type: "user.create",
        ip: headers().get("x-real-ip") ?? headers().get("x-forwarded-for"),
        username: user.username,
        userId: user.id,
        email: user.email,
        by,
      } as z.infer<typeof UserCreateEventContentSchema>,
    },
  });
}

export async function writeChatgptSharedOAuthLog(
  db: PrismaClient,
  userId: string,
  instanceId: string,
  userIp: string | null,
  requestIp: string | null,
) {
  return await db.userEventLog.create({
    data: UserEventLogSchema.omit({ id: true, timestamp: true }).parse({
      userId,
      type: "chatgpt_shared.oauth",
      resultType: "success",
      content: {
        type: "chatgpt_shared.oauth",
        instanceId,
        requestIp,
        userIp,
      } as z.infer<typeof ChatGPTSharedOAuthEventContentSchema>,
    } as UserEventLog),
  });
}
