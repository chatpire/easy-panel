import { PageShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";


export default async function InstancesPage({}) {
  return (
    <PageShell>
      <PageHeader heading="Event Logs" text="事件日志" />
      <div className="max-w-full overflow-hidden">
      </div>
    </PageShell>
  );
}
