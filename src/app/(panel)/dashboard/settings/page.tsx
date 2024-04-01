import { redirect } from "next/navigation";

import { getSessionUserAttrOrRedirect } from "@/lib/session";
import { PageHeader } from "@/app/(panel)/_components/page-header";
import { PageShell } from "@/app/(panel)/_components/dashboard-shell";
import { UserNameForm } from "@/app/(panel)/_components/user-name-form";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function SettingsPage() {
  const user = await getSessionUserAttrOrRedirect();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <PageShell>
      <PageHeader heading="Settings" text="Manage account and website settings." />
      <div className="grid gap-10">
        <UserNameForm user={{ id: user.id, name: user.name || "" }} />
      </div>
    </PageShell>
  );
}
