"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Icons } from "@/components/icons";

export function PoekmonAPIModelUsage({ instanceId, className }: { instanceId: string; className?: string }) {
  const groupResults = api.resourceLog.groupPoekmonAPIResourceLogsInDurationWindowByModel.useQuery({
    instanceId,
    durationWindow: "7d",
  });

  const groups = groupResults.data?.groups ?? [];

  // 按照 tokens 排序
  const sortedGroups = groups.sort((a, b) => b.sumTotalTokens - a.sumTotalTokens).slice(0, 5);

  return (
    <div className={cn("flex flex-col", className)}>
      <span className="text-md py-3 font-semibold">模型使用量（近7天）</span>
      {sortedGroups.length !== 0 && (
        <div className="flex flex-col space-y-2 text-sm">
          {sortedGroups.map((group) => (
            <div key={group.model} className="flex w-full flex-row justify-between">
              <div>{group.model}</div>
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="flex flex-row space-x-2">
                      <div className="flex flex-row items-center">
                        {" "}
                        <Icons.message className="mr-2 h-4 w-4" /> {group.count}
                      </div>
                      <div className="flex flex-row items-center">
                        {" "}
                        <Icons.fileBarChart className="mr-2 h-4 w-4" /> {group.sumTotalTokens}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left">
                    <p>
                      请求 {group.count} 次，总共 {group.sumTotalTokens ?? 0} tokens
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      )}
      {sortedGroups.length === 0 && (
        <div className="mx-auto flex h-[80px] w-full flex-row items-center justify-center align-middle">
          <span className="text-sm text-muted-foreground">No statistics available</span>
        </div>
      )}
    </div>
  );
}
