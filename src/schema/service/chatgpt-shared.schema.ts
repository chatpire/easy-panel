import { z } from "zod";

export const ChatGPTSharedInstanceAttributesSchema = z.object({
  type: z.literal("CHATGPT_SHARED"),
  url: z.string().url(),
  serverIp: z.string().ip(),
});

export const ChatGPTSharedOAuthEventContentSchema = z.object({
  type: z.literal("chatgpt_shared.oauth"),
  intanceId: z.string().optional(),
});
