"use client";

import { Button, type ButtonProps } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import React from "react";
import { toast } from "sonner";

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingFn?: () => Promise<void>;
}

export function LoadingButton({ loading, children, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={loading} {...props}>
      {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

interface FunctionButtonProps extends ButtonProps {
  onClick?: () => Promise<void>;
}

export function FunctionButton({ onClick, ...props }: FunctionButtonProps) {
  const [loading, setLoading] = React.useState(false);

  return (
    <LoadingButton
      loading={loading}
      onClick={async () => {
        setLoading(true);
        try {
          await onClick?.();
        } catch (e) {
          toast.error(String(e));
        } finally {
          setLoading(false);
        }
      }}
      {...props}
    />
  );
}
