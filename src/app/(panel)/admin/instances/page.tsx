import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";
import { Icons } from "@/components/icons";
import { api } from "@/trpc/server";
import { AdminInstanceInfoCard } from "./instance-info-card-admin";

export default async function InstancesPage({}) {
  const instances = await api.serviceInstance.getAllAdmin();

  return (
    <PageShell>
      <PageHeader heading="Instances" text="实例管理" />
      <div className="max-w-full overflow-hidden pb-6">
        <div className="grid gap-4 ">
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
