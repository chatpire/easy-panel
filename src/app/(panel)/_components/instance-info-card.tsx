"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StatusLabel from "@/components/custom/status-label";
import { ChatGPTSharedInstanceUsageStatistics } from "./chatgpt-shared/chatgpt-statistics";
import { ChatGPTSharedInstanceGpt4UsageList } from "./chatgpt-shared/chatgpt-gpt4-usage-list";
import { type ServiceInstance } from "@/schema/serviceInstance.schema";
import { PoekmonAPIInstanceUsageStatistics } from "./poekmon-api/poekmon-api-statistics";
import { PoekmonAPIModelUsage } from "./poekmon-api/poekmon-api-model-usage";
import { PoekmonSharedInstanceUsageStatistics } from "./poekmon-shared/poekmon-shared-statistics";
import PoekmonSharedAccountUsage from "./poekmon-shared/poekmon-shared-account-usage";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instance: ServiceInstance;
  className?: string;
}

export function SharedChatGPTCardContent({ instance }: { instance: ServiceInstance }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <ChatGPTSharedInstanceGpt4UsageList className="flex-1" instanceId={instance.id} />
      <ChatGPTSharedInstanceUsageStatistics className="flex-1" instanceId={instance.id} />
    </div>
  );
}

export function PoekmonAPICardContent({ instance }: { instance: ServiceInstance }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PoekmonAPIModelUsage instanceId={instance.id} />
      <PoekmonAPIInstanceUsageStatistics instanceId={instance.id} />
    </div>
  );
}

export function PoekmonSharedCardContent({ instance }: { instance: ServiceInstance }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <PoekmonSharedAccountUsage instanceId={instance.id} />
      <PoekmonSharedInstanceUsageStatistics instanceId={instance.id} />
    </div>
  );
}

export function InstanceInfoCard({ instance, className, children }: Props) {
  return (
    <Card className={cn("max-w-full overflow-x-hidden", className)}>
      <CardHeader className="border-b">
        <CardTitle>
          <StatusLabel status={"success"}>{instance.name}</StatusLabel>
        </CardTitle>
        {instance?.description && <CardDescription>{instance.description}</CardDescription>}
      </CardHeader>
      <CardContent className="py-3">
        {instance.type === "CHATGPT_SHARED" && <SharedChatGPTCardContent instance={instance} />}
        {instance.type === "POEKMON_API" && <PoekmonAPICardContent instance={instance} />}
        {instance.type === "POEKMON_SHARED" && <PoekmonSharedCardContent instance={instance} />}
      </CardContent>
      <CardFooter className="border-t py-3">{children}</CardFooter>
    </Card>
  );
}
