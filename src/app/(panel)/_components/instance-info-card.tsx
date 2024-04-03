"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FunctionButton } from "@/components/loading-button";
import { type ServiceInstance } from "@prisma/client";
import { api } from "@/trpc/react";
import StatusLabel from "@/components/custom/status-label";
import { copyToClipBoard } from "@/app/_helpers/copy-to-clipboard";
import { InstanceUsageStatistics } from "./instance-resource-usage-statistics";

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
        <InstanceUsageStatistics instanceId={instance.id} />
      </CardContent>
      <CardFooter className="border-t py-3">{children}</CardFooter>
    </Card>
  );
}
