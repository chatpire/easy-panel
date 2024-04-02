"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PageShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("grid max-w-full items-start gap-4", className)} {...props}>
      {children}
    </div>
  );
}
