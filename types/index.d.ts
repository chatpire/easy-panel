import { type Icons } from "@/components/icons";
import { type UserRole } from "@prisma/client";

export type HeaderNavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  role?: UserRole;
};

export type NavLink = {
  title: string;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  role?: UserRole;
  href?: string;
  icon?: keyof typeof Icons;
};

export interface SideLink extends NavLink {
  sub?: NavLink[];
}

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    github: string;
  };
};
