"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { ResourceUsageLogSchema } from "@/schema/resourceLog.schema";

export function ResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable
        className="h-[800px]"
        schema={ResourceUsageLogSchema}
        lazyPagination={true}
        fetchData={fetchData}
        defaultPageSize={20}
      />
    </div>
  );
}
