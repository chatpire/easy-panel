import { DurationWindowSchema, ServiceTypeSchema } from "@/server/db/enum";
import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { resourceUsageLogs } from "@/server/db/schema";

export const PoekmonSharedInstanceDataSchema = z.object({
  type: z.literal("POEKMON_SHARED"),
  secret: z.string(), // client secret
  points_remain: z.number().int(),
});
export type PoekmonSharedInstanceData = z.infer<typeof PoekmonSharedInstanceDataSchema>;

export const PoekmonSharedUserInstanceDataSchema = z.object({
  type: z.literal("POEKMON_SHARED"),
  chat_ids: z.array(z.string()),
  bot_ids: z.array(z.string()),
  available_points: z.number().int(), // -1 为无限
});
export type PoekmonSharedUserInstanceData = z.infer<typeof PoekmonSharedUserInstanceDataSchema>;

export const PoekmonSharedResourceUsageLogDetailsSchema = z.object({
  type: z.literal(ServiceTypeSchema.Values.POEKMON_SHARED),
  bot: z.string(),
  chatId: z.string(), // 实际为 number
  query: z.string(),
  attachments: z.array(z.string()),
  consume_point: z.number().int(),
});
export type PoekmonSharedResourceUsageLogDetails = z.infer<typeof PoekmonSharedResourceUsageLogDetailsSchema>;

export const PoekmonSharedResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.object({
    userCount: z.number().int(),
    count: z.number().int(),
    sumPoints: z.number().int().nullable(),
  }),
});
export type PoekmonSharedResourceLogSumResult = z.infer<typeof PoekmonSharedResourceLogSumResultSchema>;

export const PoekmonSharedLogGroupbyModelResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  groups: z.array(
    z.object({
      model: z.string(),
      count: z.number().int(),
      sumTotalPoints: z.number().int(),
    }),
  ),
});
export type PoekmonSharedLogGroupbyModelResult = z.infer<typeof PoekmonSharedLogGroupbyModelResultSchema>;

export const PoekmonSharedResourceUsageLogSchema = createSelectSchema(resourceUsageLogs).merge(
  z.object({
    details: PoekmonSharedResourceUsageLogDetailsSchema,
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
export type PoekmonSharedResourceUsageLog = z.infer<typeof PoekmonSharedResourceUsageLogSchema>;
