import { z } from "zod";
import { ResourceUnitSchema } from "./generated/zod";
import { DurationWindowSchema } from "./definition.schema";

export const ResourceLogSumResultSchema = z.object({
  unit: ResourceUnitSchema,
  durationWindow: DurationWindowSchema,
  value: z.number().int(),
  count: z.number().int(),
});

export type ResourceLogSumResults = z.infer<typeof ResourceLogSumResultSchema>[];
