import { z } from "zod";

export const ServiceTypeSchema = z.enum(["CHATGPT_SHARED", "POEKMON_API", "POEKMON_SHARED"]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const DURATION_WINDOWS = {
  "10m": 10 * 60,
  "30m": 30 * 60,
  "1h": 1 * 60 * 60,
  "3h": 3 * 60 * 60,
  "8h": 8 * 60 * 60,
  "24h": 24 * 60 * 60,
  "7d": 7 * 24 * 60 * 60,
  "30d": 30 * 24 * 60 * 60,
} as const;
export const DurationWindowSchema = z.enum(["10m", "30m", "1h", "3h", "8h", "24h", "7d", "30d"]);
export type DurationWindow = z.infer<typeof DurationWindowSchema>;

export const EventTypeSchema = z.enum(["user.login", "user.create", "chatgpt_shared.oauth", "poekmon_shared.auth"]);
export type EventType = z.infer<typeof EventTypeSchema>;

export const EventResultTypeSchema = z.enum(["success", "failure"]);
export type EventResultType = z.infer<typeof EventResultTypeSchema>;
