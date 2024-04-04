"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FunctionButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { copyToClipBoard } from "@/app/_helpers/copy-to-clipboard";
import { InstanceInfoCard } from "./instance-info-card";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { ServiceInstance } from "@/schema/serviceInstance.schema";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instance: ServiceInstance;
  className?: string;
}

export function AdminInstanceInfoCard({ instance, className }: Props) {
  const grantMutation = api.serviceInstance.grantToAllActiveUsers.useMutation();

  const grantToAll = async (instanceId: string) => {
    try {
      await grantMutation.mutateAsync({ instanceId });
    } catch (error) {
      console.error(error);
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      }
      toast.error("An error occured. Did you already grant to all active users?");
    }
  };

  const unpublish = async (instanceId: string) => {
    toast.info("Unpublishing is not implemented yet.");
  }

  return (
    <InstanceInfoCard instance={instance} className={className}>
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-3">
          <Button variant="link">
            <Icons.externalLink className="mr-2 h-4 w-4" />
            <Link href={instance.url ?? ""}>{instance.url}</Link>
          </Button>
        </div>
        <div className="flex flex-row items-center space-x-3">
          <FunctionButton variant={"outline"} onClick={() => grantToAll(instance.id)}>
            Publish To All Active Users
          </FunctionButton>
          <FunctionButton variant={"outline"} onClick={() => unpublish(instance.id)}>Unpublish</FunctionButton>
          <Button onClick={() => toast.info("Not implemented")}>Edit</Button>
        </div>
      </div>
    </InstanceInfoCard>
  );
}
