import { z } from "zod";

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

export const EventTypeSchema = z.enum(["user.login", "user.create", "chatgpt_shared.oauth"]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EventResultTypeSchema = z.enum(["success", "failure"]);
export type EventResultType = z.infer<typeof EventResultTypeSchema>;
