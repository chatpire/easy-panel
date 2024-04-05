"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import StatusLabel from "@/components/custom/status-label";
import { InstanceUsageStatistics } from "./instance-resource-usage-statistics";
import { InstanceGpt4UsageList } from "./instance-resource-gpt4-usage-list";
import { type ServiceInstance } from "@/schema/serviceInstance.schema";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instance: ServiceInstance;
  className?: string;
}

export function InstanceInfoCard({ instance, className, children }: Props) {
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="border-b">
        <CardTitle>
          <StatusLabel status={"success"}>{instance.name}</StatusLabel>
        </CardTitle>
        {instance?.description && <CardDescription>{instance.description}</CardDescription>}
      </CardHeader>
      <CardContent className="py-3">
        <div className="flex flex-row space-x-4">
          <InstanceGpt4UsageList className="flex-1" instanceId={instance.id} />
          <InstanceUsageStatistics className="flex-1" instanceId={instance.id} />
        </div>
      </CardContent>
      <CardFooter className="border-t py-3">{children}</CardFooter>
    </Card>
  );
}
