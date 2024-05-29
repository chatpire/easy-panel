"use client";

import * as React from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { copyToClipBoard } from "@/lib/clipboard";
import { InstanceInfoCard } from "../_components/instance-info-card";
import { type ServiceInstanceWithToken } from "@/schema/serviceInstance.schema";
import { cn } from "@/lib/utils";
import { PoekmonAPIConfigSheet } from "../_components/poekmon-api/poekmon-api-usage-sheet";
import { type UserRead } from "@/schema/user.schema";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  user: UserRead;
  instanceWithToken: ServiceInstanceWithToken;
  className?: string;
}

function UserChatGPTSharedInstanceInfoCardBottom({
  instanceWithToken,
}: {
  instanceWithToken: ServiceInstanceWithToken;
}) {
  const { token, ...instance } = instanceWithToken;
  return (
    <div className="flex w-full flex-col items-center justify-between md:flex-row">
      <Link
        className={cn(buttonVariants({ variant: "default" }), "my-1 w-full md:w-auto")}
        href={`${instance.url}/logintoken?access_token=${token}`}
        target="_blank"
      >
        <Icons.externalLink className="mr-2 h-4 w-4" />
        跳转到 ChatGPT
      </Link>
      <div className="hidden flex-row items-center space-x-3 md:flex">
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
  );
}

function UserPoekmonAPIInstanceInfoCardBottom({ instanceWithToken }: { instanceWithToken: ServiceInstanceWithToken }) {
  const { token, ...instance } = instanceWithToken;
  return (
    <div className="flex w-full flex-col items-center justify-between md:flex-row">
      <PoekmonAPIConfigSheet instanceDetails={instanceWithToken} />
      <div className="hidden flex-row items-center space-x-3 md:flex">
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
  );
}

function UserPoekmonSharedInstanceInfoCardBottom({
  user,
  instanceWithToken,
}: {
  user: UserRead;
  instanceWithToken: ServiceInstanceWithToken;
}) {
  const { token, ...instance } = instanceWithToken;

  return (
    <div className="flex w-full flex-col items-center justify-between md:flex-row">
      <Link
        className={cn(buttonVariants({ variant: "default" }), "my-1 w-full md:w-auto")}
        href={`${instance.url}/login?user_id=${user.id}&token=${token}`}
        target="_blank"
      >
        <Icons.externalLink className="mr-2 h-4 w-4" />
        跳转到 Poe
      </Link>
      <div className="hidden flex-row items-center space-x-3 md:flex">
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
  );
}

export function UserInstanceInfoCard({ user, instanceWithToken, className }: Props) {
  const { token, ...instance } = instanceWithToken;
  return (
    <InstanceInfoCard instance={instance} className={className}>
      {instance.type === "CHATGPT_SHARED" && (
        <UserChatGPTSharedInstanceInfoCardBottom instanceWithToken={instanceWithToken} />
      )}
      {instance.type === "POEKMON_API" && (
        <UserPoekmonAPIInstanceInfoCardBottom instanceWithToken={instanceWithToken} />
      )}
      {instance.type === "POEKMON_SHARED" && (
        <UserPoekmonSharedInstanceInfoCardBottom user={user} instanceWithToken={instanceWithToken} />
      )}
    </InstanceInfoCard>
  );
}
