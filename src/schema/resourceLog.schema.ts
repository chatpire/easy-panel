import { z } from "zod";
import { ResourceUnitSchema } from "./generated/zod";
import { DurationWindowSchema } from "./definition.schema";

export const ResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  count: z.number().int(),
  utf8LengthSum: z.number().int().nullable(),
  tokensLengthSum: z.number().int().nullable(),
});

export type ResourceLogSumResults = z.infer<typeof ResourceLogSumResultSchema>[];
