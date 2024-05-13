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
  const [baseUrl, setBaseUrl] = React.useState("<base_url>");
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* <pre>
        {`curl -X 'POST' \\
  ${baseUrl}/api/poekmon/${instance.id}/v1/chat/completions \\
  -H 'accept: application/json' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: <YOUR_TOKEN>' \\
  -d '{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "user",
      "content": "hello"
    }
  ],
  "stream": true
}'`}
      </pre> */}
      <PoekmonAPIModelUsage instanceId={instance.id} />
      <PoekmonAPIInstanceUsageStatistics instanceId={instance.id} />
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
      </CardContent>
      <CardFooter className="border-t py-3">{children}</CardFooter>
    </Card>
  );
}
