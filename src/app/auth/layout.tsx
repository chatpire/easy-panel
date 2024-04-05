import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";
import {getSessionData} from "@/server/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionData();
  if (session?.userAttr) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container relative w-min flex-col items-center justify-center">
        <Card className="lg:p-8">{children}</Card>
      </div>
    </div>
  );
}
