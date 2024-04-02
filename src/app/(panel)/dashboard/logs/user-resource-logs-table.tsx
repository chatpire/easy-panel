"use client";

import { DataTable } from "@/components/data-table";
import { type PaginationInput } from "@/schema/pagination.schema";
import { UserResourceUsageLogSchema } from "@/schema/generated/zod";

const UserResourceUsageLogDisplaySchema = UserResourceUsageLogSchema.pick({
  timestamp: true,
  instanceId: true,
  openaiTeamId: true,
  unit: true,
  amount: true,
});

export function UserResourceLogsTable({ fetchData }: { fetchData: (input: PaginationInput) => Promise<any> }) {
  return (
    <div className="w-full">
      <DataTable schema={UserResourceUsageLogDisplaySchema} lazyPagination={true} fetchData={fetchData} />
    </div>
  );
}
