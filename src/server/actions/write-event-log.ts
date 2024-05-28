import {
  type UserCreateEventContentCreatedBy,
  type UserCreateEventContentSchema,
  type UserLoginEventContentSchema,
} from "@/schema/definition.schema";
import { headers } from "next/headers";
import { type z } from "zod";
import { type ChatGPTSharedOAuthEventContentSchema } from "@/schema/service/chatgpt-shared.schema";
import { type Db } from "../db";
import { eventLogs } from "../db/schema";
import { createCUID } from "@/lib/cuid";
import { type User } from "@/schema/user.schema";
import { type PoekmonSharedAuthEventContentSchema } from "@/schema/service/poekmon-shared.schema";

export async function writeUserLoginEventLog(
  db: Db,
  userId: string,
  resultType: "success" | "failure",
  method: "password" | "oidc",
) {
  return await db
    .insert(eventLogs)
    .values({
      id: createCUID(),
      userId,
      type: "user.login",
      resultType,
      content: {
        type: "user.login",
        ip: headers().get("x-real-ip") ?? headers().get("x-forwarded-for"),
        method,
      } as z.infer<typeof UserLoginEventContentSchema>,
    })
    .returning();
}

export async function writeUserCreateEventLog(db: Db, user: User, by: UserCreateEventContentCreatedBy) {
  return await db
    .insert(eventLogs)
    .values({
      id: createCUID(),
      userId: user.id,
      type: "user.create",
      resultType: "success",
      content: {
        type: "user.create",
        ip: headers().get("x-real-ip") ?? headers().get("x-forwarded-for"),
        username: user.username,
        userId: user.id,
        email: user.email,
        createdBy: by,
      } as z.infer<typeof UserCreateEventContentSchema>,
    })
    .returning();
}

export async function writeChatgptSharedOAuthLog(
  db: Db,
  userId: string,
  instanceId: string,
  userIp: string | null,
  requestIp: string | null,
) {
  return await db
    .insert(eventLogs)
    .values({
      id: createCUID(),
      userId,
      type: "chatgpt_shared.oauth",
      resultType: "success",
      content: {
        type: "chatgpt_shared.oauth",
        instanceId,
        requestIp,
        userIp,
      } as z.infer<typeof ChatGPTSharedOAuthEventContentSchema>,
    })
    .returning();
}

export async function writePoekmonSharedAuthLog(
  db: Db,
  userId: string,
  instanceId: string,
  userIp: string | null,
  requestIp: string | null,
) {
  return await db
    .insert(eventLogs)
    .values({
      id: createCUID(),
      userId,
      type: "poekmon_shared.auth",
      resultType: "success",
      content: {
        type: "poekmon_shared.auth",
        instanceId,
        requestIp,
        userIp,
      } as z.infer<typeof PoekmonSharedAuthEventContentSchema>,
    })
    .returning();
}
