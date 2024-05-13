import { ServiceTypeSchema } from "@/server/db/enum";
import { create } from "domain";
import { z } from "zod";

export const PoekmonAPIInstanceDataSchema = z.object({
  type: z.literal("POEKMON_API"),
  auth_key: z.string(),
  record_prompts: z.boolean(),
  record_completions: z.boolean(),
});

export const OpenAIRequestMessageSchema = z.object({
  role: z.enum(["user", "system", "assistant", "tool"]),
  content: z.string(),
  name: z.string().optional(),
});

export const OpenAIResponseMessageSchema = z.object({
  role: z.enum(["user", "system", "assistant", "tool"]).optional(),
  content: z.string().optional(),
});

export const OpenAIResponseUsageSchema = z.object({
  prompt_tokens: z.number().int(),
  completion_tokens: z.number().int(),
  total_tokens: z.number().int(),
});

export const PoekmonAPIResourceUsageLogDetailsSchema = z.object({
  type: z.literal(ServiceTypeSchema.Values.POEKMON_API),
  bot_name: z.string(),
  prompt_messages: z.array(OpenAIRequestMessageSchema).optional(),
  completion_messages: z.array(OpenAIResponseMessageSchema).optional(),
  is_stream: z.boolean(),
  finish_reason: z.string().optional(),
  usage: OpenAIResponseUsageSchema.optional(),
  created_at: z.date(),
});
