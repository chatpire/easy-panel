// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type PaginationInput } from "@/schema/pagination.schema";
import { PageShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";
import { ResourceLogsTable } from "./resource-logs-table";
import { api } from "@/trpc/server";
import { getCurrentUserOrRedirect } from "@/lib/session";

async function fetchData(pagination: PaginationInput) {
  "use server";

  const user = await getCurrentUserOrRedirect();

  return await api.resourceLog.getAllByUser({ pagination, userId: user.id});
}

export default async function UsersPage({}) {
  return (
    <PageShell>
      <PageHeader heading="Logs" text="对话日志" />
      <div className="max-w-full overflow-hidden">
        <ResourceLogsTable fetchData={fetchData} />
      </div>
    </PageShell>
  );
}
