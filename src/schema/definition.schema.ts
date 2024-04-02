import { z } from "zod";
import {
  ChatGPTSharedInstanceAttributesSchema,
  ChatGPTSharedOAuthEventContentSchema,
} from "./service/chatgpt-shared.schema";

export const ServiceTypeSchema = z.enum(["CHATGPT_SHARED"]);

export const DURATION_WINDOWS = {
  "10m": 10 * 60,
  "30m": 30 * 60,
  "1h": 1 * 60 * 60,
  "3h": 3 * 60 * 60,
  "1d": 24 * 60 * 60,
  "7d": 7 * 24 * 60 * 60,
  "30d": 30 * 24 * 60 * 60,
} as const;

export const DurationWindowSchema = z.enum(["10m", "30m", "1h", "3h", "1d", "7d", "30d"]);

export type DurationWindow = z.infer<typeof DurationWindowSchema>;

export const ServiceInstanceAttributesSchema = z.discriminatedUnion("type", [ChatGPTSharedInstanceAttributesSchema]);

export const EventTypeSchema = z.enum([
  "user.login",
  "user.logout",
  "user.create",
  "user.update",
  "user.delete",
  "user.password_change",
  "chatgpt_shared.oauth",
]);

export const EventContentSchema = z.discriminatedUnion("type", [ChatGPTSharedOAuthEventContentSchema]);

export const EventResultTypeSchema = z.enum(["success", "failure"]);

export const ResourceEventTypeSchema = z.enum(["consume"]);

export const ResourcePermissionSchema = z.enum(["view", "use"]);
