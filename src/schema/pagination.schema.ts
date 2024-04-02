import { z } from "zod";

export const PaginationInputSchema = z.object({
  currentPage: z.number().int().positive(),
  pageSize: z.number().int().positive().optional().default(10),
});

export const PaginationOutputSchema = z.object({
  total: z.number().int(),
  currentPage: z.number().int(), // 1-based
  totalPages: z.number().int(),
  nextPage: z.number().int().nullable(),
  prevPage: z.number().int().nullable(),
});

export const createPaginatedOutputSchema = <T extends z.ZodType<any>>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationOutputSchema,
  });

export type PaginatedOutput<T> = {
  data: T[];
  pagination: PaginationOutput;
};

export const getPaginatedDataSchema = <T extends z.ZodType<any>>(dataSchema: T) =>
  z.object({
    data: z.array(dataSchema),
    pagination: PaginationOutputSchema,
  });

export type PaginationInput = z.infer<typeof PaginationInputSchema>;
export type PaginationOutput = z.infer<typeof PaginationOutputSchema>;
export type PaginatedData<T> = {
  data: T[];
  pagination: PaginationOutput;
};
