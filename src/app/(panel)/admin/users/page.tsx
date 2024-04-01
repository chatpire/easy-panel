// import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardShell } from "../../_components/dashboard-shell";
import { PageHeader } from "../../_components/page-header";
import { Button } from "@/components/ui/button";
import { UsersTable } from "./users-table";

export default async function UsersPage({}) {
  return (
    <DashboardShell>
      <PageHeader heading="Users" text="用户管理" />
      {/* <div className="grid gap-10">
        <Card className="max-w-full overflow-hidden">
          <CardContent className="mt-2">
            <UsersTable />
          </CardContent>
        </Card>
      </div> */}
      <div className="max-w-full overflow-hidden">
        <UsersTable />
      </div>
    </DashboardShell>
  );
}
