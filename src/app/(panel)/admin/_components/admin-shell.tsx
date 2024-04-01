"use client";

import { adminNavConfig } from "@/config/navigation";
import useIsCollapsed from "@/hooks/use-is-collapsed";
import dynamic from "next/dynamic";

const AdminSidebar = dynamic(() => import("./admin-sidebar"));

interface AdminShellProps {
  children?: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  "use client";
  const [isCollapsed, setIsCollapsed] = useIsCollapsed();

  return (
    <>
      {/* <div className="grid flex-1 gap-12 md:grid-cols-[200px_1fr]"> */}
      {/* <aside className="hidden w-[200px] flex-col md:flex">
          <AdminSidebar items={adminNavConfig} />
        </aside> */}
      <div className="relative h-full overflow-hidden bg-background">
        <AdminSidebar items={adminNavConfig} isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        {/* <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
         */}
        <main
          id="content"
          className={`overflow-x-hidden px-4 pt-20 transition-[margin] md:overflow-y-hidden md:px-8 md:pt-4 ${isCollapsed ? "md:ml-14" : "md:ml-64"} h-full`}
        >
          {children}
        </main>
      </div>
    </>
  );
}
