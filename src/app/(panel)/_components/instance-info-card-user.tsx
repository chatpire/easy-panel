"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FunctionButton } from "@/components/loading-button";
import { type ServiceInstance } from "@prisma/client";
import { api } from "@/trpc/react";
import { copyToClipBoard } from "@/app/_helpers/copy-to-clipboard";
import { InstanceInfoCard } from "./instance-info-card";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instance: ServiceInstance;
  className?: string;
}

export function UserInstanceInfoCard({ instance, className }: Props) {
  const instanceTokenQuery = api.user.getInstanceToken.useQuery({ instanceId: instance.id });
  const token = instanceTokenQuery.data?.token ?? null;
  const generateTokenMutation = api.user.generateToken.useMutation();

  const generateToken = async (instanceId: string) => {
    await generateTokenMutation.mutateAsync({ instanceId });
    await instanceTokenQuery.refetch();
  };

  return (
    <InstanceInfoCard instance={instance} className={className}>
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-3">
          {/* <Input id="name" className="w-[400px]" defaultValue={token} placeholder="你还没有任何 UserToken" size={32} /> */}
          <Label>Token</Label>
          <span className="rounded-md border px-3 py-1 text-sm">
            {token ?? "无"}
            <Button
              className="ml-2 rounded p-1"
              variant={"ghost"}
              size={"sm"}
              disabled={!token}
              onClick={async () => {
                await copyToClipBoard(token);
              }}
            >
              <Icons.copy className="h-3 w-3" />
            </Button>
          </span>
        </div>
        <div className="flex flex-row items-center space-x-3">
          <FunctionButton variant={"outline"} disabled={!!token} onClick={() => generateToken(instance.id)}>
            生成 Token
          </FunctionButton>
          <Button>
            <Icons.externalLink className="mr-2 h-4 w-4" />
            <Link href={`${instance.url}?access_token=${token}`} target="_blank">
              跳转到 ChatGPT
            </Link>
          </Button>
        </div>
      </div>
    </InstanceInfoCard>
  );
}
