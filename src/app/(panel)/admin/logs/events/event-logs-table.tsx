"use client";

import { DataTable } from "@/components/data-table";
import { EventLogSchemaWithUser } from "@/schema/eventLog.schema";
import { type PaginationInput } from "@/schema/pagination.schema";

export function EventLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable
        className="h-[800px]"
        schema={EventLogSchemaWithUser}
        enableColumnSelector={true}
        lazyPagination={true}
        fetchData={fetchData}
        defaultPageSize={20}
        defaultColumnVisibility={{
          userId: false,
          user: false,
        }}
      />
    </div>
  );
}
