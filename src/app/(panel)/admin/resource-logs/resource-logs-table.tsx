"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { UserResourceUsageLogSchema } from "@/schema/generated/zod";

export function ResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable className="h-[800px]" schema={UserResourceUsageLogSchema} lazyPagination={true} fetchData={fetchData} defaultPageSize={20} />
    </div>
  );
}
