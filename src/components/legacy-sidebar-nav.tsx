"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { type NavItem } from "types";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

interface Props {
  items: NavItem[];
  className?: string;
}

export function LegacySidebarNav({ items, className }: Props) {
  const path = usePathname();

  if (!items?.length) {
    return null;
  }

  return (
    <nav className={cn("grid items-start gap-2", className)}>
      {items.map((item, index) => {
        const Icon = Icons[item.icon ?? "arrowRight"];
        return (
          item.href && (
            <Link key={index} href={item.disabled ? "/" : item.href} target={item.external ? "_blank" : "_self"}>
              <span
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  path === item.href ? "bg-accent" : "transparent",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
                {item.external && <Icons.externalLink className="ml-1 h-4 w-4 opacity-60" />}
              </span>
            </Link>
          )
        );
      })}
    </nav>
  );
}
