import { getCurrentUserOrRedirect } from "@/lib/session";
import { PageShell } from "../_components/dashboard-shell";
import { PageHeader } from "../_components/page-header";
import { api } from "@/trpc/server";
import { UserInstanceInfoCard } from "../_components/instance-info-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Icons } from "@/components/icons";

export default async function DashboardPage({}) {
  await getCurrentUserOrRedirect();
  const instances = await api.serviceInstance.getAll();

  return (
    <PageShell>
      <PageHeader heading="Dashboard" text="" />
      <Alert>
        <Icons.rocket className="h-4 w-4" />
        <AlertTitle className="mt-1">使用说明</AlertTitle>
        <AlertDescription className="mt-3">
          <p>1. 生成 Token：若 Token 处内容为空，请点击“生成Token”按钮生成一个 Token。Token 用于在该共享账号中认证身份和隔离对话。</p>
          <p>2. 挑选 ChatGPT 账号：目前共有 {instances.length} 个 ChatGPT 账号。请根据每个账号上的使用情况，挑选一个在线人数较少的进行使用。</p>
          <p>3. 点击“跳转到 ChatGPT”按钮，开始使用共享账号。</p>

        </AlertDescription>
      </Alert>
      <div className="grid gap-10">
        {instances.map((instance) => (
          <UserInstanceInfoCard key={instance.id} instance={instance} />
        ))}
      </div>
    </PageShell>
  );
}
