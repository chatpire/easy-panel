"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ServiceType, ServiceTypeSchema } from "@/server/db/enum";
import { ChatGPTSharedResourceUsageLogSchema } from "@/schema/service/chatgpt-shared.schema";
import {
  PoekmonAPIResourceUsageLogSchema,
} from "@/schema/service/poekmon-api.schema";
import { PoekmonSharedResourceUsageLogSchema } from "@/schema/service/poekmon-shared.schema";

type TabConfig = {
  type: ServiceType,
  name: string,
  schema: any,
  visibility: Record<string, boolean>,
};

export function ResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput, type: ServiceType) => Promise<any> }) {
  const tabsConfig = [
    {
      type: ServiceTypeSchema.Values.CHATGPT_SHARED,
      name: "ChatGPT Shared",
      schema: ChatGPTSharedResourceUsageLogSchema,
      visibility: {
        type: false,
        userId: false,
        instanceId: false,
        instance: false,
        instance_url: false,
        user: false,
        details: false,
        details_type: false,
        details_inputTokens: false,
      }
    },
    {
      type: ServiceTypeSchema.Values.POEKMON_SHARED,
      name: "Poekmon Shared",
      schema: PoekmonSharedResourceUsageLogSchema,
      visibility: {
        type: false,
        userId: false,
        text: false,
        textBytes: false,
        instanceId: false,
        instance: false,
        instance_url: false,
        user: false,
        details: false,
        details_type: false,
        details_attachments: false,
        details_chat_id: false,
        details_chat_code: false,
      }
    },
    {
      type: ServiceTypeSchema.Values.POEKMON_API,
      name: "Poekmon API",
      schema: PoekmonAPIResourceUsageLogSchema,
      visibility: {
        type: false,
        userId: false,
        text: false,
        textBytes: false,
        instanceId: false,
        instance: false,
        instance_url: false,
        user: false,
        details: false,
        details_type: false,
        details_inputTokens: false,
      }
    },
  ] as TabConfig[];

  return (
    <Tabs defaultValue={ServiceTypeSchema.Values.CHATGPT_SHARED} className="w-full">
      <TabsList>
        {tabsConfig.map((tab) => (
          <TabsTrigger key={tab.type} value={tab.type}>
            {tab.name}
          </TabsTrigger>
        ))}
      </TabsList>
      {tabsConfig.map((tab) => (
        <TabsContent key={tab.type} value={tab.type}>
          <div className="w-full">
            <DataTable
              className="h-[800px]"
              schema={tab.schema}
              lazyPagination={true}
              fetchData={(input) => fetchData(input, tab.type)}
              defaultPageSize={20}
              enableColumnSelector={true}
              defaultColumnVisibility={tab.visibility}
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
