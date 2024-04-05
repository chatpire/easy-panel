import { z } from "zod";

import { ServiceTypeSchema } from "@/server/db/enum";

export const ChatGPTSharedInstanceAttributesSchema = z.object({
  type: z.literal("CHATGPT_SHARED"),
  url: z.string().url(),
  serverIp: z.string().ip(),
});

export const ChatGPTSharedOAuthEventContentSchema = z.object({
  type: z.literal("chatgpt_shared.oauth"),
  intanceId: z.string().optional(),
  requestIp: z.string().ip().nullable(),
  userIp: z.string().ip().nullable(),
});

export const ChatGPTSharedResourceUsageLogDetailsSchema = z.object({
  type: z.literal(ServiceTypeSchema.Values.CHATGPT_SHARED),
  model: z.string().optional(),
  chatgptAccountId: z.string().optional(),
  inputTokens: z.number().int().optional(),
  conversationId: z.string().optional(),
});
