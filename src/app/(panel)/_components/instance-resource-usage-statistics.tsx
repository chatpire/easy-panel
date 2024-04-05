"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

type StatisticItem = {
  duration: string;
  userCount: number;
  count: number;
  utf8LengthSum: number;
};

export function InstanceUsageStatistics({ instanceId, className }: { instanceId: string; className?: string }) {
  const sumResult = api.resourceLog.sumLogsInDurationWindowsByInstance.useQuery({
    durationWindows: ["10m", "1h", "3h", "1d"],
    instanceId,
  });

  const allLogsAreEmpty = sumResult.data?.every((item) => item.stats.length === 0);

  const statisticsItems: StatisticItem[] =
    sumResult.data?.map((item) => ({
      duration: item.durationWindow,
      userCount: item.stats.length,
      count: item.stats.reduce((acc, stat) => acc + stat.count, 0),
      utf8LengthSum: item.stats.reduce((acc, stat) => acc + (stat.sumUtf8Length ?? 0), 0),
    })) ?? [];

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-md py-3 font-semibold">最近使用情况</span>
      {!allLogsAreEmpty && (
        <div className="flex flex-col space-y-2 text-sm">
          {statisticsItems.map(
            (item) =>
              item.count > 0 && (
                <div key={item.duration} className="flex w-full flex-row justify-between">
                  <div>Last {item.duration}</div>
                  <div className="flex flex-row space-x-2">
                    <span>{item.userCount} 用户在线</span>
                    <span>对话 {item.count} 次</span>
                    <span>共 {item.utf8LengthSum} 字符</span>
                  </div>
                </div>
              ),
          )}
        </div>
      )}
      {allLogsAreEmpty && (
        <div className="mx-auto flex h-[80px] w-full flex-row items-center justify-center align-middle">
          <span className="text-sm text-muted-foreground">No statistics available</span>
        </div>
      )}
    </div>
  );
}
