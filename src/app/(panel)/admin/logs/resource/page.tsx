// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type PaginationInput } from "@/schema/pagination.schema";
import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { ResourceLogsTable } from "./admin-resource-logs-table";
import { api } from "@/trpc/server";

async function fetchData(pagination: PaginationInput) {
  "use server";
  return await api.resourceLog.getMany({ pagination, where: {} });
}

export default async function UsersPage({}) {
  return (
    <PageShell>
      <PageHeader heading="Resource Logs" text="资源使用日志" />
      <div className="max-w-full overflow-hidden">
        <ResourceLogsTable fetchData={fetchData} />
      </div>
    </PageShell>
  );
}
