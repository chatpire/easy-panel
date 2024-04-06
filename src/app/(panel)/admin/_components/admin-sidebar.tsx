"use client";

import { useEffect, useState } from "react";
import { Layout, LayoutHeader } from "@/components/custom/layout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { type NavItem } from "types";
import { useUserAttr } from "@/components/session-provider";
import Link from "next/link";
import SidebarNav from "@/components/custom/sidebar-nav";
import { ThemeToggle } from "@/components/mode-toggle";

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  items: NavItem[];
}

export default function AdminSidebar({ className, isCollapsed, setIsCollapsed, items }: SidebarProps) {
  const [navOpened, setNavOpened] = useState(false);

  const userAttr = useUserAttr();

  /* Make body not scrollable when navBar is opened */
  useEffect(() => {
    if (navOpened) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [navOpened]);

  return (
    <aside
      className={cn(
        `fixed left-0 right-0 top-0 z-50 w-full border-r-2 border-r-muted transition-[width] md:bottom-0 md:right-auto md:h-svh ${isCollapsed ? "md:w-14" : "md:w-64"}`,
        className,
      )}
    >
      {/* Overlay in mobile */}
      <div
        onClick={() => setNavOpened(false)}
        className={`absolute inset-0 transition-[opacity] delay-100 duration-700 ${navOpened ? "h-svh opacity-50" : "h-0 opacity-0"} w-full bg-black md:hidden`}
      />

      <Layout>
        {/* Header */}
        <LayoutHeader className="sticky top-0 justify-between border-b px-4 py-4 md:px-4">
          <div className="flex w-full flex-row justify-between">
            <div className={`flex items-center ${!isCollapsed ? "gap-2" : ""}`}>
              <Link href="/">
                <Icons.logo className={cn("transition-all", isCollapsed ? "h-6 w-6" : "h-6 w-6")} />
              </Link>
              <div className={`flex flex-col justify-end truncate ${isCollapsed ? "invisible w-0" : "visible w-auto"}`}>
                <span className="font-medium">Easy Panel Admin</span>
              </div>
            </div>
            <div suppressHydrationWarning className={isCollapsed ? "invisible w-0" : "visible w-auto"}>
              <ThemeToggle />
            </div>
          </div>

          {/* Toggle Button in mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle Navigation"
            aria-controls="sidebar-menu"
            aria-expanded={navOpened}
            onClick={() => setNavOpened((prev) => !prev)}
          >
            {navOpened ? <Icons.close /> : <Icons.chevronRight />}
          </Button>
        </LayoutHeader>

        {/* Navigation links */}
        <SidebarNav
          // id='sidebar-menu'
          className={`h-full flex-1 overflow-auto ${navOpened ? "max-h-screen" : "max-h-0 py-0 md:max-h-screen md:py-2"}`}
          items={items}
          closeNav={() => setNavOpened(false)}
          isCollapsed={isCollapsed}
        />

        {/* Scrollbar width toggle button */}
        <Button
          onClick={() => setIsCollapsed((prev) => !prev)}
          size="icon"
          variant="outline"
          className="absolute -right-5 top-1/2 hidden rounded-full md:inline-flex"
        >
          <Icons.chevronLeft className={`h-5 w-5 ${isCollapsed ? "rotate-180" : ""}`} />
        </Button>
      </Layout>
    </aside>
  );
}
