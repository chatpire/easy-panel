import { type TRPCContext } from "@/server/trpc";
import { and, count, eq, gte, sql, countDistinct } from "drizzle-orm";
import { resourceUsageLogs } from "@/server/db/schema";
import { DURATION_WINDOWS, type DurationWindow, ServiceTypeSchema } from "@/server/db/enum";
import { memoize } from "@/lib/memoize";
import {
  type ChatGPTSharedGPT4LogGroupbyAccountResult,
  type ChatGPTSharedResourceLogSumResult,
} from "@/schema/service/chatgpt-shared.schema";
import {
  type PoekmonAPILogGroupbyModelResult,
  type PoekmonAPIResourceLogSumResult,
} from "@/schema/service/poekmon-api.schema";
import { PoekmonSharedResourceLogSumResult } from "@/schema/service/poekmon-shared.schema";

const _sumChatGPTSharedLogsInDurationWindows = async ({
  ctx,
  durationWindows,
  timeEnd,
  userId,
  instanceId,
}: {
  ctx: TRPCContext;
  durationWindows: DurationWindow[];
  timeEnd: Date;
  userId?: string;
  instanceId?: string;
}): Promise<ChatGPTSharedResourceLogSumResult[]> => {
  const results = [] as ChatGPTSharedResourceLogSumResult[];

  for (const durationWindow of durationWindows) {
    const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
    const aggResult = await ctx.db
      .select({
        userCount: countDistinct(resourceUsageLogs.userId),
        count: count(),
        sumUtf8Length: sql<number>`sum(${resourceUsageLogs.textBytes})`.mapWith(Number),
        // sumTokensLength: sum(resourceUsageLogs.tokensLength).mapWith(Number),
        sumTokensLength: sql<number>`0`.mapWith(Number), // todo
      })
      .from(resourceUsageLogs)
      .where(
        and(
          eq(resourceUsageLogs.type, ServiceTypeSchema.Values.CHATGPT_SHARED),
          gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
          userId ? eq(resourceUsageLogs.userId, userId) : sql`true`,
          instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
        ),
      );
    // .groupBy(resourceUsageLogs.userId);

    results.push({
      durationWindow,
      stats: aggResult[0]!,
    });
  }

  return results;
};

export const sumChatGPTSharedLogsInDurationWindows = memoize(_sumChatGPTSharedLogsInDurationWindows, {
  genKey: ({ durationWindows, timeEnd, userId, instanceId }) => {
    return JSON.stringify({ durationWindows, timeEnd, userId, instanceId });
  },
  shouldUpdate: (args, lastArgs) => {
    return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
  },
});

const _groupGPT4LogsInDurationWindow = async ({
  ctx,
  durationWindow,
  instanceId,
  timeEnd,
}: {
  ctx: TRPCContext;
  durationWindow: DurationWindow;
  instanceId?: string;
  timeEnd: Date;
}): Promise<ChatGPTSharedGPT4LogGroupbyAccountResult> => {
  const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
  const groupByResult = await ctx.db
    .select({
      chatgptAccountId: sql<string | null>`${resourceUsageLogs.details}->>'chatgptAccountId'`,
      _count: count(),
    })
    .from(resourceUsageLogs)
    .where(
      and(
        eq(resourceUsageLogs.type, ServiceTypeSchema.Values.CHATGPT_SHARED),
        // sql`${resourceUsageLogs.createdAt} >= ${new Date(new Date().getTime() - durationWindowSeconds * 1000)}`,
        gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
        instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
        sql`${resourceUsageLogs.details}->>'model' LIKE 'gpt-4%'`,
      ),
    )
    .groupBy(sql`${resourceUsageLogs.details}->>'chatgptAccountId'`);
  const result = {
    durationWindow,
    counts: groupByResult.map((item) => ({
      chatgptAccountId: item.chatgptAccountId,
      count: item._count,
    })),
  };
  return result;
};

export const groupGPT4LogsInDurationWindow = memoize(_groupGPT4LogsInDurationWindow, {
  genKey: ({ durationWindow, instanceId }) => {
    return JSON.stringify({ durationWindow, instanceId });
  },
  shouldUpdate: (args, lastArgs) => {
    return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
  },
});

const _sumPoekmonAPILogsInDurationWindows = async ({
  ctx,
  durationWindows,
  timeEnd,
  userId,
  instanceId,
}: {
  ctx: TRPCContext;
  durationWindows: DurationWindow[];
  timeEnd: Date;
  userId?: string;
  instanceId?: string;
}): Promise<PoekmonAPIResourceLogSumResult[]> => {
  const results = [] as PoekmonAPIResourceLogSumResult[];

  for (const durationWindow of durationWindows) {
    const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
    const aggResult = await ctx.db
      .select({
        userCount: countDistinct(resourceUsageLogs.userId),
        count: count(),
        sumPromptTokens:
          sql<number>`SUM((${resourceUsageLogs.details} -> 'usage' ->> 'prompt_tokens')::integer)`.mapWith(Number),
        sumCompletionTokens:
          sql<number>`SUM((${resourceUsageLogs.details} -> 'usage' ->> 'completion_tokens')::integer)`.mapWith(Number),
        sumTotalTokens: sql<number>`SUM((${resourceUsageLogs.details} -> 'usage' ->> 'total_tokens')::integer)`.mapWith(
          Number,
        ),
      })
      .from(resourceUsageLogs)
      .where(
        and(
          eq(resourceUsageLogs.type, ServiceTypeSchema.Values.POEKMON_API),
          gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
          userId ? eq(resourceUsageLogs.userId, userId) : sql`true`,
          instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
        ),
      );
    // .groupBy(resourceUsageLogs.userId);

    results.push({
      durationWindow,
      stats: aggResult[0]!,
    });
  }

  return results;
};

export const sumPoekmonAPILogsInDurationWindows = memoize(_sumPoekmonAPILogsInDurationWindows, {
  genKey: ({ durationWindows, timeEnd, userId, instanceId }) => {
    return JSON.stringify({ durationWindows, timeEnd, userId, instanceId });
  },
  shouldUpdate: (args, lastArgs) => {
    return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
  },
});

const _groupPoekmonAPILogsInDurationWindowByModel = async ({
  ctx,
  durationWindow,
  instanceId,
  timeEnd,
}: {
  ctx: TRPCContext;
  durationWindow: DurationWindow;
  instanceId?: string;
  timeEnd: Date;
}): Promise<PoekmonAPILogGroupbyModelResult> => {
  const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
  const groupByResult = await ctx.db
    .select({
      model: sql<string | null>`${resourceUsageLogs.details}->>'model'`,
      count: count(),
      sumTotalTokens: sql<number>`SUM((${resourceUsageLogs.details} -> 'usage' ->> 'total_tokens')::integer)`.mapWith(
        Number,
      ),
    })
    .from(resourceUsageLogs)
    .where(
      and(
        eq(resourceUsageLogs.type, ServiceTypeSchema.Values.POEKMON_API),
        gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
        instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
      ),
    )
    .groupBy(sql`${resourceUsageLogs.details}->>'model'`);
  const result = {
    durationWindow,
    groups: groupByResult
      .filter((item) => item.model !== null)
      .map((item) => ({
        model: item.model!,
        count: item.count,
        sumTotalTokens: item.sumTotalTokens,
      })),
  };
  return result;
};

export const groupPoekmonAPILogsInDurationWindowByModel = memoize(_groupPoekmonAPILogsInDurationWindowByModel, {
  genKey: ({ durationWindow, instanceId }) => {
    return JSON.stringify({ durationWindow, instanceId });
  },
  shouldUpdate: (args, lastArgs) => {
    return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
  },
});

const _sumPoekmonSharedLogsInDurationWindows = async ({
    ctx,
    durationWindows,
    timeEnd,
    userId,
    instanceId,
  }: {
    ctx: TRPCContext;
    durationWindows: DurationWindow[];
    timeEnd: Date;
    userId?: string;
    instanceId?: string;
  }): Promise<PoekmonSharedResourceLogSumResult[]> => {
    const results = [] as PoekmonSharedResourceLogSumResult[];
  
    for (const durationWindow of durationWindows) {
      const durationWindowSeconds = DURATION_WINDOWS[durationWindow];
      const aggResult = await ctx.db
        .select({
          userCount: countDistinct(resourceUsageLogs.userId),
          count: count(),
          sumPoints:
            sql<number>`SUM((${resourceUsageLogs.details} -> 'consume_point')::integer)`.mapWith(Number),
        })
        .from(resourceUsageLogs)
        .where(
          and(
            eq(resourceUsageLogs.type, ServiceTypeSchema.Values.POEKMON_SHARED),
            gte(resourceUsageLogs.createdAt, new Date(timeEnd.getTime() - durationWindowSeconds * 1000)),
            userId ? eq(resourceUsageLogs.userId, userId) : sql`true`,
            instanceId ? eq(resourceUsageLogs.instanceId, instanceId) : sql`true`,
          ),
        );
      // .groupBy(resourceUsageLogs.userId);
  
      results.push({
        durationWindow,
        stats: aggResult[0]!,
      });
    }
  
    return results;
  };
  
  export const sumPoekmonSharedLogsInDurationWindows = memoize(_sumPoekmonSharedLogsInDurationWindows, {
    genKey: ({ durationWindows, timeEnd, userId, instanceId }) => {
      return JSON.stringify({ durationWindows, timeEnd, userId, instanceId });
    },
    shouldUpdate: (args, lastArgs) => {
      return args[0].timeEnd.getTime() !== lastArgs[0].timeEnd.getTime();
    },
  });
  