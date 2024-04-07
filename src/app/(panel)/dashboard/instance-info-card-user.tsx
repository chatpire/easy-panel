"use client";

import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { api } from "@/trpc/react";
import { copyToClipBoard } from "@/lib/clipboard";
import { InstanceInfoCard } from "../_components/instance-info-card";
import { type ServiceInstanceWithToken } from "@/schema/serviceInstance.schema";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instanceWithToken: ServiceInstanceWithToken;
  className?: string;
}

export function UserInstanceInfoCard({ instanceWithToken, className }: Props) {
  const { token, ...instance } = instanceWithToken;
  return (
    <InstanceInfoCard instance={instance} className={className}>
      <div className="flex w-full flex-row items-center justify-between">
        <div className="flex flex-row items-center space-x-3">
          <Link
            className={buttonVariants({ variant: "default" })}
            href={`${instance.url}/logintoken?access_token=${token}`}
            target="_blank"
          >
            <Icons.externalLink className="mr-2 h-4 w-4" />
            跳转到 ChatGPT
          </Link>
        </div>
        <div className="flex flex-row items-center space-x-3">
          <Label>Token</Label>
          <span className="rounded-md border px-3 py-1 text-sm">
            {token ?? "无使用权限，请联系管理员创建 Token"}
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
      </div>
    </InstanceInfoCard>
  );
}
