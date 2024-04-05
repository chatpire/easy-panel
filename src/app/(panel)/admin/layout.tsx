import { getSessionOrRedirect } from "@/lib/session";
import AdminShell from "./_components/admin-shell";
import SessionProvider from "@/components/session-provider";
import { redirect } from "next/navigation";
import { UserRoles } from "@/schema/user.schema";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSessionOrRedirect();
  if (session.userAttr?.role !== UserRoles.ADMIN) {
    redirect("/dashboard");
  }

  return (
    <SessionProvider value={session}>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
