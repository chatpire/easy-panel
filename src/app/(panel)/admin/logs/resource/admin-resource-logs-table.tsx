"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { ChatGPTSharedResourceUsageLogSchema } from "@/schema/resourceLog.schema";

export function ResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable
        className="h-[800px]"
        schema={ChatGPTSharedResourceUsageLogSchema}
        lazyPagination={true}
        fetchData={fetchData}
        defaultPageSize={20}
        enableColumnSelector={true}
        defaultColumnVisibility={{
          type: false,
          "details": false,
          "details_type": false,
          "details_inputTokens": false
        }}
      />
    </div>
  );
}
