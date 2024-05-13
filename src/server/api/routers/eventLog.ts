import { createTRPCRouter, adminProcedure, type TRPCContext } from "@/server/trpc";
import { PaginationInputSchema } from "@/schema/pagination.schema";
import { z } from "zod";
import { paginateQuery } from "../pagination";
import { EventLogSchema, EventLogWhereInputSchema } from "@/schema/eventLog.schema";
import { type SQL, and, count, eq, gte, lte, desc, getTableColumns } from "drizzle-orm";
import { eventLogs, users } from "@/server/db/schema";

const PaginationEventLogsInputSchema = z.object({
  where: EventLogWhereInputSchema,
  pagination: PaginationInputSchema,
});

const getPaginatedResourceLogs = async ({
  input,
  ctx,
}: {
  input: z.infer<typeof PaginationEventLogsInputSchema>;
  ctx: TRPCContext;
}) => {
  return paginateQuery({
    pagination: input.pagination,
    ctx,
    responseItemSchema: EventLogSchema,
    handle: async ({ skip, take, ctx }) => {
      const where = input.where;
      const andParams = [] as SQL[];
      if (where.userId) {
        andParams.push(eq(eventLogs.userId, where.userId));
      }
      if (where.type) {
        andParams.push(eq(eventLogs.type, where.type));
      }
      if (where.timeStart) {
        andParams.push(gte(eventLogs.createdAt, where.timeStart));
      }
      if (where.timeEnd) {
        andParams.push(lte(eventLogs.createdAt, where.timeEnd));
      }
      const filter = and(...andParams);
      const { total, result } = await ctx.db.transaction(async (tx) => {
        const total = await tx
          .select({
            value: count(),
          })
          .from(eventLogs)
          .where(and(...andParams));
        const result = await tx
          .select({
            ...getTableColumns(eventLogs),
            user: {
              username: users.username,
              name: users.name,
            }
          })
          .from(eventLogs)
          .where(filter)
          .leftJoin(users, eq(eventLogs.userId, users.id))
          .orderBy(desc(eventLogs.createdAt))
          .limit(take)
          .offset(skip);
        return { result, total: total[0]!.value };
      });
      return { result, total };
    },
  });
};

export const eventLogRouter = createTRPCRouter({
  getMany: adminProcedure
    .input(
      z.object({
        where: EventLogWhereInputSchema,
        pagination: PaginationInputSchema,
      }),
    )
    .query(async ({ input, ctx }) => {
      return getPaginatedResourceLogs({ input, ctx });
    }),
});
