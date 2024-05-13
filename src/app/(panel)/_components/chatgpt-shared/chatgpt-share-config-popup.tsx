"use client";

import * as React from "react";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { popup } from "@/components/popup";
import { Icons } from "@/components/icons";
import { Textarea } from "@/components/ui/textarea";
import { copyToClipBoard } from "@/lib/clipboard";

const ServiceInstanceSchema = z.object({
  url: z.string().url(),
  id: z.string(),
});

type ServiceInstanceDetails = z.infer<typeof ServiceInstanceSchema>;

export function popupChatGPTShareInstanceConfigDetails(instanceDetails: ServiceInstanceDetails) {
  const closePopup = popup({
    title: "Instance Configuration",
    description: "View details of the service instance",
    content: () => <ChatGPTShareInstanceConfigDetailsPopup instanceDetails={instanceDetails} closePopup={closePopup} />,
  });

  return closePopup;
}

interface InstanceConfigDetailsProps {
  className?: string;
  instanceDetails: ServiceInstanceDetails;
  closePopup: () => void;
}

function ChatGPTShareInstanceConfigDetailsPopup({
  className,
  instanceDetails,
  closePopup,
}: InstanceConfigDetailsProps) {
  const { id } = instanceDetails;
  const [baseUrl, setBaseUrl] = React.useState("<base_url>");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(`${window.location.protocol}//${window.location.host}`);
    }
  }, []);
  const configValue = `AUDIT_LIMIT_URL: ${baseUrl}/api/external/cockroachai/audit/${id}\n\nOAUTH_URL: ${baseUrl}/api/external/cockroachai/oauth/${id}`;

  return (
    <div className={cn("grid items-start gap-4", className)}>
      <div>
        <div className="mb-2 flex flex-row items-center justify-between ">
          <label htmlFor="url" className="block text-sm font-medium">
            请按照如下设置配置 Cockroachai：
          </label>
          <Button type="button" variant="ghost" className="p-2 text-xs" onClick={() => copyToClipBoard(configValue)}>
            <Icons.copy className="mr-2 h-4 w-4" />
            Copy
          </Button>
        </div>
        <Textarea id="config" value={configValue} readOnly className="h-[200px] w-full " />
      </div>
      <Button type="button" className="mt-2" onClick={closePopup}>
        <Icons.close className="mr-2 h-4 w-4" />
        Close
      </Button>
    </div>
  );
}
