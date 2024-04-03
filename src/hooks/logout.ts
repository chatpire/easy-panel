import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { api } from "@/trpc/react";

export function useLogout() {
  const logoutMutation = api.auth.logout.useMutation();
  const router = useRouter();

  async function logout() {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out successfully");
      router.push("/auth/login");
    } catch (error) {
      if (error instanceof TRPCClientError) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred");
      }
      console.error(error);
    }
  }

  return logout;
}
