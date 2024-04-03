"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { UserEventLogSchema } from "@/schema/generated/zod";

export function EventLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable className="h-[800px]" schema={UserEventLogSchema} lazyPagination={true} fetchData={fetchData} defaultPageSize={20} />
    </div>
  );
}
