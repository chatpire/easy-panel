"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OIDCLoginButton({ children, className }: { children?: React.ReactNode; className?: string }) {
  const router = useRouter();
  return (
    <Button onClick={() => router.push("/auth/oidc/login")} variant="default" className={className}>
      {children}
    </Button>
  );
}
