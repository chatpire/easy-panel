import { ResourceUsageLogDetails, ServiceType } from "@/schema/definition.schema";
import { Db } from "../db";
import { resourceUsageLogs } from "../db/schema";
import { createCUID } from "@/lib/cuid";

export async function writeChatResourceUsageLog(
  db: Db,
  userId: string,
  instanceId: string,
  text: string | null,
  type: ServiceType,
  details: ResourceUsageLogDetails,
) {
  return await db
    .insert(resourceUsageLogs)
    .values({
      id: createCUID(),
      userId,
      instanceId,
      type,
      text,
      details,
    })
    .returning();
}
