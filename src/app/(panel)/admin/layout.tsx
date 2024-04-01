import { getSessionOrRedirect } from "@/lib/session";
import AdminShell from "./_components/admin-shell";
import SessionProvider from "@/components/session-provider";

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

export default async function AdminDashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getSessionOrRedirect();

  return (
    <SessionProvider value={session}>
      <AdminShell>{children}</AdminShell>
    </SessionProvider>
  );
}
