import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageShell } from "../../_components/dashboard-shell";
import { InstanceInfoCard } from "../../_components/instance-info-card";
import { PageHeader } from "../../_components/page-header";
import { Icons } from "@/components/icons";
import { api } from "@/trpc/server";
import { AdminInstanceInfoCard } from "../../_components/instance-info-card-admin";

export default async function InstancesPage({}) {
  const instances = await api.serviceInstance.getAll();

  return (
    <PageShell>
      <PageHeader heading="Instances" text="实例管理" />
      <div className="max-w-full overflow-hidden">
        <div className="grid gap-10">
          {instances.map((instance) => (
            <AdminInstanceInfoCard key={instance.id} instance={instance} />
          ))}
        </div>
        {instances.length === 0 && (
          <Alert>
            <Icons.warning className="h-4 w-4" />
            <AlertTitle className="mt-1">Empty</AlertTitle>
            <AlertDescription className="mt-3">
              <p>Please create instances first.</p>
            </AlertDescription>
          </Alert>
        )}
      </div>
    </PageShell>
  );
}
