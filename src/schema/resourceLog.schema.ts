import { z } from "zod";
import { ResourceUnitSchema } from "./generated/zod";
import { DurationWindowSchema } from "./definition.schema";

export const ResourceLogSumResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  stats: z.array(
    z.object({
      userId: z.string().nullable(),
      count: z.number().int(),
      utf8LengthSum: z.number().int().nullable(),
      tokensLengthSum: z.number().int().nullable(),
    }),
  ),
});

export const GPT4LogGroupbyAccountResultSchema = z.object({
  durationWindow: DurationWindowSchema,
  counts: z.array(
    z.object({
      openaiTeamId: z.string().nullable(),
      count: z.number().int(),
    }),
  ),
});

export type ResourceLogSumResult = z.infer<typeof ResourceLogSumResultSchema>;
export type GPT4LogGroupbyAccountResult = z.infer<typeof GPT4LogGroupbyAccountResultSchema>;
