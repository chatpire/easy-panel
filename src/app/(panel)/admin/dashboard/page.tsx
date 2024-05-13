import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";
import { getVersion } from "@/lib/version";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage({}) {
  const currentVersion = getVersion();

  return (
    <PageShell>
      <PageHeader heading="System Info" text="系统概览" />
      <div className="grid gap-10">
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
            <CardDescription>服务状态</CardDescription>
          </CardHeader>
          <CardContent className="text-sm">
                当前版本：<Badge variant="outline">{currentVersion}</Badge>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
