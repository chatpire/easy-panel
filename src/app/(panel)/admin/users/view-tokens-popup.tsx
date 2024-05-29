"use client";

import * as React from "react";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { popup } from "@/components/popup";
import { api } from "@/trpc/react";
import { Icons } from "@/components/icons";
import { copyToClipBoard } from "@/lib/clipboard";

export function popupUserInstanceTokensViewer(userId: string, username: string) {
  const closePopup = popup({
    title: "用户 Token",
    description: `@${username}`,
    content: (clossFn) => <TokenViewer userId={userId} closePopup={clossFn} />,
  });

  return closePopup;
}

interface Props extends React.ComponentProps<"form"> {
  className?: string;
  userId: string;
  closePopup: () => void;
}

function TokenViewer({ className, userId, closePopup }: Props) {
  const instancesQuery = api.serviceInstance.getAllAdmin.useQuery();
  const userInstanceAbilitiesQuery = api.userInstanceAbility.getMany.useQuery({ userId });

  const abilities = userInstanceAbilitiesQuery.data ?? [];

  return (
    // 一个 list，左侧是 instance 名称，右侧分别是 token 和访问按钮
    <div className={cn("max-h-[600px] overflow-y-auto", className)}>
      <div className="divide-y divide-gray-200">
        {abilities.map((ability) => {
          const instance = instancesQuery.data?.find((instance) => instance.id === ability.instanceId);
          if (!instance) {
            return null;
          }
          const token = ability.token;

          return (
            <div key={`${token}`} className="flex items-center justify-between px-4 py-2 text-xs">
              <div className="text-sm text-gray-800">{instance.name}</div>
              <div className="flex flex-col items-center justify-between space-x-2 md:flex-row">
                <Button
                  className="rounded p-2"
                  variant={"ghost"}
                  disabled={!token}
                  onClick={async () => {
                    await copyToClipBoard(token);
                  }}
                >
                  <Icons.copy className="mr-1 h-4 w-4" />
                  Token
                </Button>
                <Button
                  className="rounded p-2"
                  variant={"ghost"}
                  disabled={!token}
                  onClick={async () => {
                    await copyToClipBoard(`${instance.url}/logintoken?access_token=${ability.token}`);
                  }}
                >
                  <Icons.copy className="mr-1 h-4 w-4" />
                  URL
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
