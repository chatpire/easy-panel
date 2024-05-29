import { getCurrentUserOrRedirect } from "@/lib/session";
import { PageShell } from "../_components/dashboard-shell";
import { PageHeader } from "../_components/page-header";
import { api } from "@/trpc/server";
import { UserInstanceInfoCard } from "./instance-info-card-user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { globalSettingsManager } from "@/server/globalSettings";
import { UserRead } from "@/schema/user.schema";

export default async function DashboardPage({}) {
  const user = await getCurrentUserOrRedirect();
  const instances = await api.serviceInstance.getAllWithToken();
  const announcement = await globalSettingsManager.getSettingContent("chatGPTShareAnnouncement");

  return (
    <PageShell>
      <PageHeader heading="Dashboard" text="使用共享服务" />
      <Alert>
        <Icons.rocket className="h-4 w-4" />
        <AlertTitle className="mt-1">使用说明</AlertTitle>
        <AlertDescription className="mt-3">
          {announcement.text}
        </AlertDescription>
      </Alert>
      <div className="grid gap-6">
        {instances.map((instance) => (
          <UserInstanceInfoCard key={instance.id} user={user} instanceWithToken={instance} />
        ))}
      </div>
      {instances.length === 0 && (
        <Alert>
          <Icons.warning className="h-4 w-4" />
          <AlertTitle className="mt-1">无可用 ChatGPT 账号</AlertTitle>
          <AlertDescription className="mt-3">
            <p>当前您没有可用的 ChatGPT 账号，请联系管理员。</p>
          </AlertDescription>
        </Alert>
      )}
    </PageShell>
  );
}
