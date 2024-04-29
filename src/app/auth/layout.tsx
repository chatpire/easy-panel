import { redirect } from "next/navigation";
import { getSessionData } from "@/server/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionData();
  if (session?.userAttr) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
        {children}
    </div>
  );
}
