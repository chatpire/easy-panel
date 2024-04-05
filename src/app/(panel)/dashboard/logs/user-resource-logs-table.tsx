"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { ResourceUsageLogSchema } from "@/schema/resourceLog.schema";

const UserResourceUsageLogDisplaySchema = ResourceUsageLogSchema.pick({
  timestamp: true,
  instanceId: true,
  details: true,
});

export function UserResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable schema={UserResourceUsageLogDisplaySchema} lazyPagination={true} fetchData={fetchData} />
    </div>
  );
}
