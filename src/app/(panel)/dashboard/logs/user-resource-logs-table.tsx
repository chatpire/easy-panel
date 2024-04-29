"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { ChatGPTSharedResourceUsageLogSchema } from "@/schema/resourceLog.schema";

const UserResourceUsageLogDisplaySchema = ChatGPTSharedResourceUsageLogSchema.pick({
  createdAt: true,
  instanceName: true,
  details: true,
});

export function UserResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable schema={UserResourceUsageLogDisplaySchema} lazyPagination={true} fetchData={fetchData} />
    </div>
  );
}
