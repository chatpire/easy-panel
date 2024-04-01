import { getCurrentUserOrRedirect } from "@/lib/session";
import { DashboardShell } from "../_components/dashboard-shell";
import { PageHeader } from "../_components/page-header";
import { api } from "@/trpc/server";
import { UserInstanceInfoCard } from "../_components/instance-info-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";

export default async function DashboardPage({}) {
  await getCurrentUserOrRedirect();
  const instances = await api.serviceInstance.getAll();

  return (
    <DashboardShell>
      <PageHeader heading="Dashboard" text="" />
      <Alert>
        <Icons.rocket className="h-4 w-4" />
        <AlertTitle>使用 ChatGPT 共享账号</AlertTitle>
        <AlertDescription>以下是可用的共享账号。请根据统计数据，选择其中用量较少的一个来使用。</AlertDescription>
      </Alert>
      <div className="grid gap-10">
        {instances.map((instance) => (
          <UserInstanceInfoCard key={instance.id} instance={instance} />
        ))}
      </div>
    </DashboardShell>
  );
}
