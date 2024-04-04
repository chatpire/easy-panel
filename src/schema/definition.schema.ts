import { z } from "zod";
import {
  ChatGPTSharedInstanceAttributesSchema,
  ChatGPTSharedOAuthEventContentSchema,
  ChatGPTSharedResourceUsageLogDetailsSchema,
} from "./service/chatgpt-shared.schema";

export const ServiceTypeSchema = z.enum(["CHATGPT_SHARED"]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

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

export const EventTypeSchema = z.enum(["user.login", "user.create", "chatgpt_shared.oauth"]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const UserLoginEventContentSchema = z.object({
  type: z.literal("user.login"),
  method: z.enum(["password", "oidc"]),
  ip: z.string().ip().optional(),
});

export const UserCreateEventContentCreatedBySchema = z.enum(["admin", "oidc"]);
export type UserCreateEventContentCreatedBy = z.infer<typeof UserCreateEventContentCreatedBySchema>;

export const UserCreateEventContentSchema = z.object({
  type: z.literal("user.create"),
  userId: z.string(),
  username: z.string(),
  email: z.string().email(),
  createdBy: UserCreateEventContentCreatedBySchema,
  ip: z.string().ip().optional(),
});

export const EventContentSchema = z
  .discriminatedUnion("type", [
    ChatGPTSharedOAuthEventContentSchema,
    UserLoginEventContentSchema,
    UserCreateEventContentSchema,
  ]);
export type EventContent = z.infer<typeof EventContentSchema>;

export const EventResultTypeSchema = z.enum(["success", "failure"]);
export type EventResultType = z.infer<typeof EventResultTypeSchema>;

export const ResourceEventTypeSchema = z.enum(["consume"]);

export const ResourcePermissionSchema = z.enum(["view", "use"]);

export const ResourceUsageLogDetailsSchema = z.discriminatedUnion("type", [ChatGPTSharedResourceUsageLogDetailsSchema]);
export type ResourceUsageLogDetails = z.infer<typeof ResourceUsageLogDetailsSchema>;
