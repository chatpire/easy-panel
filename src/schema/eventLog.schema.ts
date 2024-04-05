import { eventLogs } from "@/server/db/schema";
import exp from "constants";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { EventTypeSchema } from "@/server/db/enum";

export const EventLogSchema = createSelectSchema(eventLogs);
export type EventLog = z.infer<typeof EventLogSchema>;

export const EventLogWhereInputSchema = z.object({
  userId: z.string().optional(),
  type: EventTypeSchema.optional(),
  timeStart: z.date().optional(),
  timeEnd: z.date().optional(),
});
