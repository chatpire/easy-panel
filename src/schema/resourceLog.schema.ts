import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { resourceUsageLogs } from "@/server/db/schema";
import { DurationWindowSchema } from "@/server/db/enum";
import { ChatGPTSharedResourceUsageLogDetailsSchema } from "./service/chatgpt-shared.schema";
import { PoekmonAPIResourceUsageLogDetailsSchema } from "./service/poekmon-api.schema";

export const ResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.object({
    userCount: z.number().int(),
    count: z.number().int(),
    sumUtf8Length: z.number().int().nullable(),
    sumTokensLength: z.number().int().nullable(),
  }),
});

export const GPT4LogGroupbyAccountResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  counts: z.array(
    z.object({
      chatgptAccountId: z.string().nullable(),
      count: z.number().int(),
    }),
  ),
});

export type ResourceLogSumResult = z.infer<typeof ResourceLogSumResultSchema>;
export type GPT4LogGroupbyAccountResult = z.infer<typeof GPT4LogGroupbyAccountResultSchema>;

export const ResourceUsageLogWhereInputSchema = z.object({
  userId: z.string().optional(),
  instanceId: z.string().optional(),
  timeStart: z.date().optional(),
  timeEnd: z.date().optional(),
});

export const ResourceUsageLogDetailsSchema = z.discriminatedUnion("type", [
  ChatGPTSharedResourceUsageLogDetailsSchema,
  PoekmonAPIResourceUsageLogDetailsSchema,
]);
export type ResourceUsageLogDetails = z.infer<typeof ResourceUsageLogDetailsSchema>;

export const ResourceUsageLogSchema = createSelectSchema(resourceUsageLogs).merge(
  z.object({
    details: ResourceUsageLogDetailsSchema,
    user: z
      .object({
        username: z.string(),
        name: z.string(),
      })
      .optional(),
    instanceName: z.string().optional(),
  }),
);

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
