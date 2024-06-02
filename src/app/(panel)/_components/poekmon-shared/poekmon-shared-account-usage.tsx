"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { api } from "@/trpc/react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import StatusLabel from "@/components/custom/status-label";

export default function PoekmonSharedAccountUsage({
  instanceId,
  className,
}: {
  instanceId: string;
  className?: string;
}) {
  const accountInfoQuery = api.serviceInstance.getPoekmonSharedAccountInfo.useQuery({ id: instanceId });
  const getBackgroundColor = (value: number) => {
    let color;
    if (value > 0.6) {
      color = "bg-green-500";
    } else if (value > 0.3) {
      color = "bg-yellow-500";
    } else if (value > 0.1) {
      color = "bg-orange-500";
    } else {
      color = "bg-red-500";
    }
    return color;
  };

  const getTextColor = (value: number) => {
    let color;
    if (value > 0.6) {
      color = "text-green-500";
    } else if (value > 0.3) {
      color = "text-yellow-500";
    } else if (value > 0.1) {
      color = "text-orange-500";
    } else {
      color = "text-red-500";
    }
    return color;
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage > 0.6) {
      return "富余";
    } else if (percentage > 0.3) {
      return "充裕";
    } else if (percentage > 0.1) {
      return "将满";
    }
    return "耗尽";
  };

  let alloment = "n/a";
  let balance = "n/a";
  let percentage = 0;
  let message_point_reset_time = "n/a";
  const accountInfo = accountInfoQuery.data;
  if (accountInfo !== null && accountInfo !== undefined) {
    alloment = accountInfo.message_point_alloment.toString();
    balance = accountInfo.message_point_balance.toString();
    if (accountInfo.message_point_alloment !== 0) {
      percentage = 1 - accountInfo.message_point_balance / accountInfo.message_point_alloment;
    }
    message_point_reset_time = new Date(accountInfo.message_point_reset_time / 1000).toLocaleString();
  }

  return (
    <div className={cn("flex w-full flex-col", className)}>
      <span className="text-md my-3 font-semibold">Poe 账号概况</span>
      <div className="flex w-full flex-col space-y-2">
        <div className="flex w-full max-w-[500px] flex-row items-center justify-between text-sm">
          <span>积分剩余情况</span>
          <div className="flex flex-row items-center space-x-2">
            <StatusLabel pointColor={getBackgroundColor(percentage)} className={getTextColor(percentage)}>
              {getStatusLabel(percentage)}
            </StatusLabel>
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger>
                  <span>
                    {balance} / {alloment}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p>
                    剩余 {balance} 积分 / 总计 {alloment} 积分
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        <div className="flex w-full max-w-[500px] flex-row items-center justify-between text-sm">
          <span>积分重置时间</span>
          <div className="flex flex-row items-center space-x-2">
            <span>{message_point_reset_time ?? "n/a"}</span>
          </div>
        </div>
        <div className="flex w-full max-w-[500px] flex-row items-center justify-between text-sm">
          <span>订阅状态</span>
          <div className="flex flex-row items-center space-x-2">
            <span>{accountInfo?.subscription_active ? "活跃" : "无"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
