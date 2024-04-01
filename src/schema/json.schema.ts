import { z } from "zod";
import { ChatGPTSharedInstanceAttributesSchema } from "./service/chatgpt-shared.schema";

export const ServiceTypeSchema = z.enum(["CHATGPT_SHARED"]);

export const ResourceTypeSchema = z.enum([
  "CHATGPT_SHARED_GPT_3.5",
  "CHATGPT_SHARED_GPT_4",
  "CHATGPT_SHARED_GPT_4_GIZMO",
  "CHATGPT_SHARED_GPT_4_CREATOR",
]);

const DURATION_WINDOWS = {
  "1h": 1 * 60 * 60,
  "3h": 3 * 60 * 60,
  "1d": 24 * 60 * 60,
} as const;

export const DurationWindowSchema = z.nativeEnum(DURATION_WINDOWS);

export const ServiceInstanceAttributesSchema = z.discriminatedUnion("type", [ChatGPTSharedInstanceAttributesSchema]);

export const EventTypeSchema = z.enum([
  "user.login",
  "user.logout",
  "user.create",
  "user.update",
  "user.delete",
  "user.password_change",
]);

export const EventResultTypeSchema = z.enum(["success", "failure"]);

export const ResourceEventTypeSchema = z.enum(["consume"]);

export const ResourcePermissionSchema = z.enum(["view", "use"]);
