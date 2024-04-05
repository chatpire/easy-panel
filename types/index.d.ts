import { type Icons } from "@/components/icons";
import { type UserRole } from "@/schema/user.schema";

export type HeaderNavItem = {
  title: string;
  href: string;
  disabled?: boolean;
  role?: UserRole;
};

export type NavItem = {
  title: string;
  label?: string;
  disabled?: boolean;
  external?: boolean;
  role?: UserRole;
  href?: string;
  icon?: keyof typeof Icons;
};

export interface SideItem extends NavItem {
  sub?: NavItem[];
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
