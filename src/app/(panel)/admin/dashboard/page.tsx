"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PageShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";

export default function DashboardPage({}) {
  return (
    <PageShell>
      <PageHeader heading="System Info" text="系统概览" />
      <div className="grid gap-10">
        <Card>
          <CardHeader>
            <CardTitle>Server Status</CardTitle>
            <CardDescription>服务状态</CardDescription>
          </CardHeader>
          <CardContent>运转正常</CardContent>
          <CardFooter>
            <Button>一切安好</Button>
          </CardFooter>
        </Card>
      </div>
    </PageShell>
  );
}
