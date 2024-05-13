"use client";

import { api } from "@/trpc/react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import StatusLabel from "@/components/custom/status-label";

export function ChatGPTSharedInstanceGpt4UsageList({ instanceId, className }: { instanceId: string; className?: string }) {
  const gpt4GroupResults = api.resourceLog.groupChatGPTSharedGPT4LogsInDurationWindowByInstance.useQuery({
    instanceId,
    durationWindow: "3h",
  });

  const totalCount = gpt4GroupResults.data?.counts.reduce((acc, item) => acc + item.count, 0) ?? 0;
  const personalCount = gpt4GroupResults.data?.counts.find((item) => item.chatgptAccountId === "personal")?.count ?? 0;
  const teamCount = totalCount - personalCount;

  const items = [
    {
      label: "Personal",
      value: personalCount,
      quota: 40,
    },
    {
      label: "Team",
      value: teamCount,
      quota: 100,
    },
  ];

  const getBackgroundColor = (value: number) => {
    let color;
    if (value < 0.2) {
      color = "bg-green-500";
    } else if (value < 0.6) {
      color = "bg-yellow-500";
    } else if (value < 0.9) {
      color = "bg-orange-500";
    } else {
      color = "bg-red-500";
    }
    return color;
  };

  const getTextColor = (value: number) => {
    let color;
    if (value < 0.2) {
      color = "text-green-500";
    } else if (value < 0.6) {
      color = "text-yellow-500";
    } else if (value < 0.9) {
      color = "text-orange-500";
    } else {
      color = "text-red-500";
    }
    return color;
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage < 0.2) {
      return "空闲";
    } else if (percentage < 0.6) {
      return "忙碌";
    } else if (percentage < 0.9) {
      return "拥挤";
    }
    return "爆满";
  };

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <span className="text-md my-3 font-semibold">GPT-4 用量（过去 3h）</span>
      <div className="flex w-full flex-col space-y-2">
        {items.map((item) => {
          const percentage = item.value / item.quota;
          return (
            <div key={item.label} className="flex w-full max-w-[500px] flex-row items-center justify-between text-sm">
              <div className="flex flex-row">
                <StatusLabel pointColor={getBackgroundColor(percentage)} className={getTextColor(percentage)}>
                  {getStatusLabel(percentage)}
                </StatusLabel>
                <span className="ml-2">{item.label}</span>
              </div>
              <div className="flex flex-row items-center space-x-2">
                <span>
                  {item.value} / {item.quota}
                </span>
                <Progress
                  value={Math.min(percentage * 100, 100)}
                  className={cn("md:w-[200px] w-[120px] max-w-full")}
                  indicatorClassName={getBackgroundColor(percentage)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
