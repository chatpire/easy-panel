"use client";

import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FunctionButton } from "@/components/loading-button";
import { api } from "@/trpc/react";
import { copyToClipBoard } from "@/lib/clipboard";
import { InstanceInfoCard } from "../../_components/instance-info-card";
import { toast } from "sonner";
import { TRPCClientError } from "@trpc/client";
import { type ServiceInstance } from "@/schema/serviceInstance.schema";
import { popupChatGPTShareInstanceConfigDetails } from "./chatgpt-share-config-popup";
import { useRouter } from "next/navigation";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instance: ServiceInstance;
  className?: string;
}

export function AdminInstanceInfoCard({ instance, className }: Props) {
  const router = useRouter();
  const grantMutation = api.serviceInstance.grantToAllActiveUsers.useMutation();

  const grantToAll = async (instanceId: string) => {
    try {
      await grantMutation.mutateAsync({ instanceId });
      toast.success("Published to all active users.");
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
  };

  return (
    <InstanceInfoCard instance={instance} className={className}>
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-3">
          <Link className={buttonVariants({ variant: "link" })} href={instance.url ?? ""}>
            <Icons.externalLink className="mr-2 h-4 w-4" />
            {instance.url}
          </Link>
        </div>
        {/* <div className="flex flex-row items-center space-x-3">
          <Label>InstanceId</Label>
          <span className="rounded-md border px-3 py-1 text-sm">
            {instance.id}
            <Button
              className="ml-2 rounded p-1"
              variant={"ghost"}
              size={"sm"}
              onClick={async () => {
                await copyToClipBoard(instance.id);
              }}
            >
              <Icons.copy className="h-3 w-3" />
            </Button>
          </span>
        </div> */}
        <div className="flex flex-row items-center space-x-3">
          <FunctionButton variant={"outline"} onClick={() => grantToAll(instance.id)}>
            Publish To All Active Users
          </FunctionButton>
          <FunctionButton variant={"outline"} onClick={() => unpublish(instance.id)}>
            Unpublish
          </FunctionButton>
          <Button onClick={() => popupChatGPTShareInstanceConfigDetails({ url: instance.url ?? "", id: instance.id })}>
            <Icons.eye className="mr-2 h-4 w-4" />
            View Config
          </Button>
          <Button onClick={() => router.push(`/admin/instances/update/${instance.id}`)}>
            <Icons.pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>
    </InstanceInfoCard>
  );
}
