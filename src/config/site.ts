import { env } from "@/env";
import { type SiteConfig } from "types";

export const siteConfig: SiteConfig = {
  name: env.SITE_NAME,
  description: "",
  url: "https://tx.shadcn.com",
  ogImage: "https://tx.shadcn.com/og.jpg",
  links: {
    github: "https://github.com/chatpire/easy-panel",
  },
};
