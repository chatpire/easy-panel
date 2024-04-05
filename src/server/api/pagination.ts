import { type z } from "zod";
import { TRPCError } from "@trpc/server";
import { type PaginationInput, getPaginatedDataSchema, type PaginatedData } from "@/schema/pagination.schema";
import { type TRPCContext } from "../trpc";
import { computeSkip } from "@/lib/utils";

type PaginationParams<T extends z.ZodTypeAny> = {
  pagination: PaginationInput;
  ctx: TRPCContext;
  responseItemSchema: T;
  handle: ({
    skip,
    take,
    ctx,
  }: {
    skip: number;
    take: number;
    ctx: TRPCContext;
  }) => Promise<{ result: any; total: number }>;
};

export const paginateQuery = async <T extends z.AnyZodObject>({
  pagination,
  ctx,
  handle,
  responseItemSchema,
}: PaginationParams<T>) => {
  const { currentPage, pageSize } = pagination;
  if (currentPage < 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "currentPage must be greater than 0" });
  }
  if (pageSize < 1) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "pageSize must be greater than 0" });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { result, total } = await handle({
    skip: computeSkip(pagination),
    take: pageSize,
    ctx,
  });

  const totalPages = Math.ceil(total / pageSize);
  const strictResponseItemSchema = responseItemSchema.strict();
  return {
    data: result as z.infer<typeof strictResponseItemSchema>[],
    pagination: {
      total,
      currentPage,
      totalPages,
      nextPage: currentPage + 1 <= totalPages ? currentPage + 1 : null,
      prevPage: currentPage - 1 > 0 ? currentPage - 1 : null,
    },
  } as PaginatedData<T>;
};
