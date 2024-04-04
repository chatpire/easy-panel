import { z } from "zod";
import { DurationWindowSchema } from "./definition.schema";
import { createSelectSchema } from "drizzle-zod";
import { resourceUsageLogs } from "@/server/db/schema";

export const ResourceUsageLogSchema = createSelectSchema(resourceUsageLogs);

export const ResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.array(
    z.object({
      userId: z.string().nullable(),
      count: z.number().int(),
      sumUtf8Length: z.number().int().nullable(),
      sumTokensLength: z.number().int().nullable(),
    }),
  ),
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
  timestampStart: z.date().optional(),
  timestampEnd: z.date().optional(),
});