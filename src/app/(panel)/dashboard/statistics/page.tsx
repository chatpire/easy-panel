import { type PaginationInput } from "@/schema/pagination.schema";
import { PageShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";
import { UserResourceLogsTable } from "./user-resource-logs-table";
import { api } from "@/trpc/server";
import { getCurrentUserOrRedirect } from "@/lib/session";
import { UserUsageStatistics } from "./user-resource-usage-statistics";
import { ServiceTypeSchema } from "@/server/db/enum";

async function fetchData(pagination: PaginationInput) {
  "use server";

  const user = await getCurrentUserOrRedirect();

  return await api.resourceLog.getMany({
    pagination,
    where: { userId: user.id, type: ServiceTypeSchema.Values.CHATGPT_SHARED },
  });
}

export default async function UsersPage({}) {
  return (
    <PageShell>
      <PageHeader heading="Statistics" text="对话统计" />
      <UserUsageStatistics />
      {/* <div className="max-w-full overflow-hidden">
        <UserResourceLogsTable fetchData={fetchData} />
      </div> */}
    </PageShell>
  );
}
