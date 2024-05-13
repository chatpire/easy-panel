import { z } from "zod";

import { DurationWindowSchema, ServiceTypeSchema } from "@/server/db/enum";
import { createSelectSchema } from "drizzle-zod";
import { resourceUsageLogs } from "@/server/db/schema";

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

export const ChatGPTSharedResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.object({
    userCount: z.number().int(),
    count: z.number().int(),
    sumUtf8Length: z.number().int().nullable(),
    sumTokensLength: z.number().int().nullable(),
  }),
});

export const ChatGPTSharedGPT4LogGroupbyAccountResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  counts: z.array(
    z.object({
      chatgptAccountId: z.string().nullable(),
      count: z.number().int(),
    }),
  ),
});

export type ChatGPTSharedResourceLogSumResult = z.infer<typeof ChatGPTSharedResourceLogSumResultSchema>;
export type ChatGPTSharedGPT4LogGroupbyAccountResult = z.infer<typeof ChatGPTSharedGPT4LogGroupbyAccountResultSchema>;

export const ChatGPTSharedResourceUsageLogSchema = createSelectSchema(resourceUsageLogs).merge(
  z.object({
    details: ChatGPTSharedResourceUsageLogDetailsSchema,
    user: z
      .object({
        username: z.string(),
        name: z.string(),
      })
      .optional(),
    instance: z
      .object({
        name: z.string(),
        url: z.string().url(),
      })
      .optional(),
  }),
);
