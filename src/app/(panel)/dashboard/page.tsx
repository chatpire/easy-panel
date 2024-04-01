import { getCurrentUserOrRedirect } from "@/lib/session";
import { DashboardShell } from "../_components/dashboard-shell";
import { PageHeader } from "../_components/page-header";
import { api } from "@/trpc/server";
import { InstanceInfoCard } from "../_components/instance-info-card";

export default async function DashboardPage({}) {
  await getCurrentUserOrRedirect();
  let instanceDetails = await api.user.getInstanceDetails();

  const generateToken = async (instanceId: string) => {
    "use server";
    await api.user.generateToken({ instanceId });
    instanceDetails = await api.user.getInstanceDetails();
  };

  return (
    <DashboardShell>
      <PageHeader heading="Dashboard" text="" />
      <div className="grid gap-10">
        {instanceDetails.map((instanceDetail) => (
          <InstanceInfoCard key={instanceDetail.id} instanceDetail={instanceDetail} generateToken={generateToken} />
        ))}
      </div>
    </DashboardShell>
  );
}
