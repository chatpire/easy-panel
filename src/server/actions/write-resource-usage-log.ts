import { type ResourceUsageLogDetails } from "@/schema/definition.schema";
import { type Db } from "../db";
import { resourceUsageLogs } from "../db/schema";
import { createCUID } from "@/lib/cuid";
import { ServiceTypeSchema } from "@/server/db/enum";

export async function writeChatResourceUsageLog(
  db: Db,
  {
    userId,
    instanceId,
    text,
    details,
    timestamp,
  }: {
    userId: string;
    instanceId: string;
    text: string;
    details: ResourceUsageLogDetails;
    timestamp?: Date;
  },
) {
  return await db
    .insert(resourceUsageLogs)
    .values({
      id: createCUID(),
      userId,
      instanceId,
      type: ServiceTypeSchema.Values.CHATGPT_SHARED,
      text,
      details,
      timestamp: timestamp ?? new Date(),
    })
    .returning();
}
