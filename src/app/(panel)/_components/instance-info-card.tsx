"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type UserInstanceDetail } from "@/schema/user.schema";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { FunctionButton, LoadingButton } from "@/components/loading-button";

interface Props extends React.HTMLAttributes<HTMLFormElement> {
  instanceDetail: UserInstanceDetail;
  className?: string;
  generateToken: (instanceId: string) => Promise<void>;
}

export function InstanceInfoCard({ instanceDetail, className, generateToken }: Props) {
  const { instance, token } = instanceDetail;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{instance.name}</CardTitle>
        {instance?.description && <CardDescription>{instance.description}</CardDescription>}
      </CardHeader>
      <CardContent></CardContent>
      <CardFooter className="border-t p-3">
        <div className="flex w-full flex-row items-center justify-between">
          <div className="flex flex-row items-center space-x-3">
            {/* <Input id="name" className="w-[400px]" defaultValue={token} placeholder="你还没有任何 UserToken" size={32} /> */}
            <Label>Token</Label>
            <span className="rounded-md border px-3 py-1 text-sm">
              {token}
              <Button className="ml-2 rounded p-1" variant={"ghost"} size={"sm"} disabled={!token}>
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
      </CardFooter>
    </Card>
  );
}
