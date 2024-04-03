// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { type PaginationInput } from "@/schema/pagination.schema";
import { PageShell } from "../../../_components/dashboard-shell";
import { PageHeader } from "../../../_components/page-header";
import { EventLogsTable } from "./event-logs-table";
import { api } from "@/trpc/server";

async function fetchData(pagination: PaginationInput) {
  "use server";
  return await api.eventLog.getMany({ pagination, where: {} });
}

export default async function UsersPage({}) {
  return (
    <PageShell>
      <PageHeader heading="Event Logs" text="事件日志" />
      <div className="max-w-full overflow-hidden">
        <EventLogsTable fetchData={fetchData} />
      </div>
    </PageShell>
  );
}
