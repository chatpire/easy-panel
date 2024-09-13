import { z } from "zod";
import { createSelectSchema } from "drizzle-zod";
import { resourceUsageLogs } from "@/server/db/schema";
import { DurationWindowSchema, ServiceTypeSchema } from "@/server/db/enum";
import { ChatGPTSharedResourceUsageLogDetailsSchema } from "./service/chatgpt-shared.schema";
import { PoekmonAPIResourceUsageLogDetailsSchema } from "./service/poekmon-api.schema";
import { PoekmonSharedResourceUsageLogDetailsSchema } from "./service/poekmon-shared.schema";
import { APIShareResourceUsageLogDetailsSchema } from "./service/api-share.schema";

export const ResourceUsageLogWhereInputSchema = z.object({
  userId: z.string().optional(),
  instanceId: z.string().optional(),
  type: ServiceTypeSchema.optional(),
  timeStart: z.date().optional(),
  timeEnd: z.date().optional(),
});

export const ResourceUsageLogDetailsSchema = z.discriminatedUnion("type", [
  ChatGPTSharedResourceUsageLogDetailsSchema,
  PoekmonAPIResourceUsageLogDetailsSchema,
  PoekmonSharedResourceUsageLogDetailsSchema,
  APIShareResourceUsageLogDetailsSchema,
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
