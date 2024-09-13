"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function APIShareInstanceUsageStatistics({
  instanceId,
  className,
}: {
  instanceId: string;
  className?: string;
}) {
  const sumResult = api.resourceLog.sumAPIShareLogsInDurationWindowsByInstance.useQuery({
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
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-row space-x-2">
                      {/* <span>{item.stats.userCount}</span>
                <span>{item.stats.count}</span>
                <span>{item.stats.sumUtf8Length ?? 0}</span> */}
                      <div className="flex flex-row items-center">
                        {" "}
                        <Icons.user className="mr-2 h-4 w-4" /> {item.stats.userCount}
                      </div>
                      <div className="flex flex-row items-center">
                        {" "}
                        <Icons.message className="mr-2 h-4 w-4" /> {item.stats.count}
                      </div>
                      <div className="flex flex-row items-center">
                        {" "}
                        <Icons.fileBarChart className="mr-2 h-4 w-4" />{" "}
                        {`${item.stats.sumPromptTokens ?? 0} / ${item.stats.sumCompletionTokens ?? 0} / ${item.stats.sumTotalTokens ?? 0}`}{" "}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>
                      最近 {item.durationWindow}：{item.stats.userCount} 用户使用，请求 {item.stats.count} 次，输入共{" "}
                      {item.stats.sumPromptTokens ?? 0} tokens，输出共 {item.stats.sumCompletionTokens ?? 0}{" "}
                      tokens，总共 {item.stats.sumTotalTokens ?? 0} tokens
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
