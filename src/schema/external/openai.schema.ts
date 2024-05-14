import { z } from "zod";

export const OpenAIRequestMessageSchema = z.object({
  role: z.union([z.literal("user"), z.literal("system"), z.literal("assistant"), z.literal("tool")]),
  content: z.string(),
  name: z.string().nullish(),
});
export type OpenAIRequestMessage = z.infer<typeof OpenAIRequestMessageSchema>;

export const OpenAIResponseMessageSchema = z.object({
  role: z.union([z.literal("user"), z.literal("system"), z.literal("assistant"), z.literal("tool")]).nullish(),
  content: z.string().nullish(),
});
export type OpenAIResponseMessage = z.infer<typeof OpenAIResponseMessageSchema>;

export const OpenAIChatCompletionRequestSchema = z.object({
  model: z.string(),
  messages: z.array(OpenAIRequestMessageSchema),
  stream: z.boolean().nullish(),
  logit_bias: z.record(z.number()).nullish(),
  temperature: z.number().nullish(),
});
export type OpenAIChatCompletionRequest = z.infer<typeof OpenAIChatCompletionRequestSchema>;

export const OpenAIChatCompletionResponseUsageSchema = z.object({
  prompt_tokens: z.number(),
  completion_tokens: z.number(),
  total_tokens: z.number(),
});
export type OpenAIChatCompletionResponseUsage = z.infer<typeof OpenAIChatCompletionResponseUsageSchema>;

export const OpenAIChatCompletionResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      message: OpenAIResponseMessageSchema,
      finish_reason: z.enum(["stop", "length", "content_filter", "tool_calls", "function_call"]).nullish(),
    }),
  ),
  created: z.number(),
  model: z.string(),
  system_fingerprint: z.string().nullish(),
  object: z.literal("chat.completion"),
  usage: OpenAIChatCompletionResponseUsageSchema,
});
export type OpenAIChatCompletionResponse = z.infer<typeof OpenAIChatCompletionResponseSchema>;

export const OpenAIChatCompletionStreamResponseSchema = z.object({
  id: z.string(),
  choices: z.array(
    z.object({
      index: z.number(),
      delta: OpenAIResponseMessageSchema,
      finish_reason: z.enum(["stop", "length", "content_filter", "tool_calls", "function_call"]).nullish(),
    }),
  ),
  object: z.literal("chat.completion.chunk"),
  created: z.number(),
  model: z.string(),
  usage: OpenAIChatCompletionResponseUsageSchema.nullish(),
});
export type OpenAIChatCompletionStreamResponse = z.infer<typeof OpenAIChatCompletionStreamResponseSchema>;
