"use client";

import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

export function InstanceUsageStatistics({ instanceId, className }: { instanceId: string; className?: string }) {
  const sumResult = api.resourceLog.sumLogsInDurationWindowsByInstance.useQuery({
    durationWindows: ["10m", "1h", "8h", "24h"],
    instanceId,
  });

  const allLogsAreEmpty = sumResult.data?.every((item) => item.stats.count === 0);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-md py-3 font-semibold">最近使用情况</span>
      {!allLogsAreEmpty && (
        <div className="flex flex-col space-y-2 text-sm">
          {sumResult.data?.map((item) => (
            <div key={item.durationWindow} className="flex w-full flex-row justify-between">
              <div>Last {item.durationWindow}</div>
              <div className="flex flex-row space-x-2">
                <span>{item.stats.userCount} 用户在线</span>
                <span>对话 {item.stats.count} 次</span>
                <span>共 {item.stats.sumUtf8Length ?? 0} 字符</span>
              </div>
            </div>
          ))}
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
