import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUserOrRedirect } from "@/lib/session";
import { DashboardShell } from "../_components/dashboard-shell";
import { DashboardHeader } from "../_components/dashboard-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({}) {
  const user = await getCurrentUserOrRedirect();
  const userToken = user?.userToken ?? undefined;

  return (
    <DashboardShell>
      <DashboardHeader heading="Dashboard" text="" />
      <div className="grid gap-10">
        <Card>
          <CardHeader>
            <CardTitle>User Token</CardTitle>
            <CardDescription>用于 CockroachAI 面板登录</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row space-x-3">
              <Input id="name" className="w-[400px]" value={userToken} placeholder="你还没有任何 UserToken" size={32} />
              <Button disabled={!userToken}>Copy</Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button>跳转到 ChatGPT</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardShell>
  );
}
