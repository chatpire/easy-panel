"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { ChatGPTSharedResourceUsageLogSchema } from "@/schema/service/chatgpt-shared.schema";

const UserResourceUsageLogDisplaySchema = ChatGPTSharedResourceUsageLogSchema.pick({
  createdAt: true,
  details: true,
  instance: true,
});

export function UserResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable
        schema={UserResourceUsageLogDisplaySchema}
        lazyPagination={true}
        fetchData={fetchData}
        defaultColumnVisibility={{
          type: false,
          userId: false,
          instanceId: false,
          instance: false,
          instance_url: false,
          user: false,
          details: false,
          details_type: false,
          details_inputTokens: false,
        }}
      />
    </div>
  );
}
