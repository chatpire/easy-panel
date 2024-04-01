import { z } from "zod";

export const PaginationInputSchema = z.object({
  offset: z.number().int().positive().optional(),
  limit: z.number().int().positive().default(10),
});

export const PaginationOutputSchema = z.object({
  total: z.number().int(),
  offset: z.number().int(),
  count: z.number().int(),
});

export const PaginatedDataSchema = <T extends z.ZodType<any>>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationOutputSchema,
  });
