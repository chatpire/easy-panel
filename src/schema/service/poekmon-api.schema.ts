import { DurationWindowSchema, ServiceTypeSchema } from "@/server/db/enum";
import { create } from "domain";
import { z } from "zod";
import { OpenAIRequestMessageSchema, OpenAIResponseMessageSchema } from "../external/openai.schema";

export const PoekmonAPIInstanceDataSchema = z.object({
  type: z.literal("POEKMON_API"),
  auth_key: z.string(),
  record_prompts: z.boolean(),
  record_completions: z.boolean(),
});
export type PoekmonInstanceData = z.infer<typeof PoekmonAPIInstanceDataSchema>;

export const OpenAIResponseUsageSchema = z.object({
  prompt_tokens: z.number().int(),
  completion_tokens: z.number().int(),
  total_tokens: z.number().int(),
});

export const PoekmonAPIResourceUsageLogDetailsSchema = z.object({
  type: z.literal(ServiceTypeSchema.Values.POEKMON_API),
  model: z.string(),
  prompt_messages: z.array(OpenAIRequestMessageSchema).optional(),
  completion_messages: z.array(OpenAIResponseMessageSchema).optional(),
  is_stream: z.boolean(),
  finish_reason: z.string().optional(),
  usage: OpenAIResponseUsageSchema.optional(),
});
export type PoekmonAPIResourceUsageLogDetails = z.infer<typeof PoekmonAPIResourceUsageLogDetailsSchema>;

export const PoekmonAPIResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.object({
    userCount: z.number().int(),
    count: z.number().int(),
    sumPromptTokens: z.number().int().nullable(),
    sumCompletionTokens: z.number().int().nullable(),
    sumTotalTokens: z.number().int().nullable(),
  }),
});
export type PoekmonAPIResourceLogSumResult = z.infer<typeof PoekmonAPIResourceLogSumResultSchema>;

export const PoekmonAPILogGroupbyModelResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  groups: z.array(
    z.object({
      model: z.string(),
      count: z.number().int(),
      sumTotalTokens: z.number().int(),
    }),
  ),
});
export type PoekmonAPILogGroupbyModelResult = z.infer<typeof PoekmonAPILogGroupbyModelResultSchema>;