import { DurationWindowSchema, ServiceTypeSchema } from "@/server/db/enum";
import { create } from "domain";
import { z } from "zod";
import {
  OpenAIRequestMessageSchema,
  OpenAIResponseMessageSchema,
  OpenAIResponseUsageSchema,
} from "../external/openai.schema";
import { createSelectSchema } from "drizzle-zod";
import { resourceUsageLogs } from "@/server/db/schema";

export const APIShareTypeSchema = z.enum(["OPENAI"]); // only openai is supported now, ANTHROPIC is not supported
export type APIShareType = z.infer<typeof APIShareTypeSchema>;

export const APIShareModelSchema = z.object({
  code: z.string(),
  code_alias: z.array(z.string()),
  upstream_model: z.string().optional(), // if not set, use code as model
  tags: z.array(z.string()),
  description: z.string().optional(),
  prompt_price: z.number().positive(), // per 1M tokens
  completion_price: z.number().positive(), // per 1M tokens
});
export type APIShareModel = z.infer<typeof APIShareModelSchema>;

export const APIShareInstanceDataSchema = z.object({
  type: z.literal("API_SHARE"),
  api_type: APIShareTypeSchema,
  upstream_url: z.string().url(),
  token: z.string(),
  models: z.array(APIShareModelSchema),
  model_tags: z.array(z.string()),
  default_tag_whitelist: z.array(z.string()),
  record_prompts: z.boolean(),
  record_completions: z.boolean(),
});
export type APIShareInstanceData = z.infer<typeof APIShareInstanceDataSchema>;

export const defaultAPIShareInstanceData = (): APIShareInstanceData => ({
  type: "API_SHARE",
  api_type: "OPENAI",
  upstream_url: "",
  token: "",
  models: [],
  model_tags: [],
  default_tag_whitelist: [],
  record_prompts: true,
  record_completions: true,
});

export const APIShareUserInstanceDataSchema = z.object({
  type: z.literal("API_SHARE"), // must be API_SHARE
  tag_whitelist: z.array(z.string()),
});
export type APIShareUserInstanceData = z.infer<typeof APIShareUserInstanceDataSchema>;

export const defaultAPIShareUserInstanceData = (): APIShareUserInstanceData => ({
  type: "API_SHARE",
  tag_whitelist: [],
});

export const APIShareResponseUsageSchema = OpenAIResponseUsageSchema;

export const APIShareResourceUsageLogDetailsSchema = z.object({
  type: z.literal(ServiceTypeSchema.Values.API_SHARE),
  model: z.string(),
  prompt_messages: z.array(OpenAIRequestMessageSchema).optional(),
  completion_messages: z.array(OpenAIResponseMessageSchema).optional(),
  is_stream: z.boolean(),
  finish_reason: z.string().optional(),
  usage: APIShareResponseUsageSchema.optional(),
  cost: z.number().optional(),
});
export type APIShareResourceUsageLogDetails = z.infer<typeof APIShareResourceUsageLogDetailsSchema>;

export const APIShareResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.object({
    userCount: z.number().int(),
    count: z.number().int(),
    sumPromptTokens: z.number().int().nullable(),
    sumCompletionTokens: z.number().int().nullable(),
    sumTotalTokens: z.number().int().nullable(),
  }),
});
export type APIShareResourceLogSumResult = z.infer<typeof APIShareResourceLogSumResultSchema>;

export const APIShareLogGroupbyModelResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  groups: z.array(
    z.object({
      model: z.string(),
      count: z.number().int(),
      sumTotalTokens: z.number().int(),
    }),
  ),
});
export type APIShareLogGroupbyModelResult = z.infer<typeof APIShareLogGroupbyModelResultSchema>;

export const APIShareResourceUsageLogSchema = createSelectSchema(resourceUsageLogs).merge(
  z.object({
    details: APIShareResourceUsageLogDetailsSchema,
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
export type APIShareResourceUsageLog = z.infer<typeof APIShareResourceUsageLogSchema>;
