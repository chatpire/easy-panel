// Modified from shadcn-admin/src/components/nav.tsx
"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import useCheckActiveNav from "@/hooks/use-check-active-nav";
import { type NavItem, type SideItem } from "types";
import { Icons } from "../icons";

interface NavProps extends React.HTMLAttributes<HTMLDivElement> {
  isCollapsed: boolean;
  items: NavItem[];
  closeNav: () => void;
}

export default function SidebarNav({ items, isCollapsed, className, closeNav }: NavProps) {
  const renderLink = (item: SideItem) => {
    const key = `${item.title}-${item.href}`;
    if (isCollapsed && item.sub) return <NavLinkIconDropdown item={item} key={key} closeNav={closeNav} />;

    if (isCollapsed) return <NavLinkIcon item={item} key={key} closeNav={closeNav} />;

    if (item.sub) return <NavLinkDropdown item={item} key={key} closeNav={closeNav} />;

    return <NavLink item={item} key={key} closeNav={closeNav} />;
  };
  return (
    <div
      data-collapsed={isCollapsed}
      className={cn(
        "group border-b bg-background py-4 transition-[max-height,padding] duration-500  md:border-none",
        className,
      )}
    >
      <TooltipProvider delayDuration={0}>
        <nav className="grid gap-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-4">
          {items.map(renderLink)}
        </nav>
      </TooltipProvider>
    </div>
  );
}

interface NavLinkProps {
  item: SideItem;
  subLink?: boolean;
  closeNav: () => void;
}

function Icon({ icon, className }: { icon: keyof typeof Icons | undefined; className?: string }) {
  if (icon) {
    const Icon = Icons[icon];
    return <Icon className={cn(className, "h-5 w-5")} />;
  } else {
    return <div className={cn(className, "h-5 w-2")} />;
  }
}

function getHref(href: string | undefined, disabled: boolean | undefined) {
  return disabled ? "/" : href ?? "#";
}

function NavLink({ item, subLink, closeNav }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav();
  const href = getHref(item.href, item.disabled);

  return (
    <Link
      href={href}
      onClick={closeNav}
      className={cn(
        buttonVariants({
          variant: checkActiveNav(href) ? "secondary" : "ghost",
          size: "default",
        }),
        "h-12 justify-start text-wrap rounded-none px-5",
        subLink && "h-10 w-full border-l border-l-slate-500 px-2",
        item.disabled && "cursor-not-allowed opacity-80",
      )}
      aria-current={checkActiveNav(href) ? "page" : undefined}
    >
      <Icon className="mr-2" icon={item.icon} />
      {item.title}
      {item.label && (
        <div className="ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-primary-foreground">{item.label}</div>
      )}
    </Link>
  );
}

function NavLinkDropdown({ item, closeNav }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav();
  const { title, sub, label, icon } = item;

  /* Open collapsible by default
   * if one of child element is active */
  // const isChildActive = !!sub?.find((s) => checkActiveNav(s.href));
  const isChildActive = true;

  return (
    <Collapsible defaultOpen={isChildActive}>
      <CollapsibleTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "default" }),
          "group h-12 w-full justify-start rounded-none px-5",
          item.disabled && "cursor-not-allowed opacity-80",
        )}
      >
        <Icon className="mr-2" icon={icon} />
        {title}
        {label && (
          <div className="ml-2 rounded-lg bg-primary px-1 text-[0.625rem] text-primary-foreground">{label}</div>
        )}
        <span className={cn('ml-auto transition-all group-data-[state="open"]:-rotate-180')}>
          <Icons.chevronDown />
        </span>
      </CollapsibleTrigger>
      <CollapsibleContent className="collapsibleDropdown" asChild>
        <ul>
          {sub!.map((sublink) => (
            <li key={sublink.title} className="my-2 ml-8">
              <NavLink item={sublink} subLink={true} closeNav={closeNav} />
            </li>
          ))}
        </ul>
      </CollapsibleContent>
    </Collapsible>
  );
}

function NavLinkIcon({ item }: NavLinkProps) {
  const { checkActiveNav } = useCheckActiveNav();
  const { title, icon, label } = item;
  // const Icon = Icons[icon ?? "arrowRight"];
  const href = getHref(item.href, item.disabled);
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link
          href={href}
          className={cn(
            buttonVariants({
              variant: checkActiveNav(href) ? "secondary" : "ghost",
              size: "icon",
            }),
            item.disabled && "cursor-not-allowed opacity-80",
            "h-12 w-12",
          )}
        >
          <Icon icon={icon} />
          <span className="sr-only">{title}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="right" className="flex items-center gap-4">
        {title}
        {label && <span className="ml-auto text-muted-foreground">{label}</span>}
      </TooltipContent>
    </Tooltip>
  );
}

function NavLinkIconDropdown({ item }: NavLinkProps) {
  const { title, icon, sub, label } = item;
  const { checkActiveNav } = useCheckActiveNav();

  /* Open collapsible by default
   * if one of child element is active */
  const isChildActive = !!sub?.find((s) => checkActiveNav(s.href));

  return (
    <DropdownMenu>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant={isChildActive ? "secondary" : "ghost"} size="icon" className="h-12 w-12">
              <Icon icon={icon} />
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-4">
          {title} {label && <span className="ml-auto text-muted-foreground">{label}</span>}
          <Icons.chevronDown size={12} className="text-muted-foreground" />
        </TooltipContent>
      </Tooltip>
      <DropdownMenuContent side="right" align="start" sideOffset={4} className="space-y-1">
        <DropdownMenuLabel>
          {title} {label ? `(${label})` : ""}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {sub!.map(({ title, icon, label, href }) => {
          return (
            <DropdownMenuItem key={`${title}-${href}`} asChild>
              <Link href={href ?? {}} className={`${checkActiveNav(href) ? "bg-secondary" : ""}`}>
                <Icon icon={icon} />
                <span className="ml-2 max-w-52 text-wrap">{title}</span>
                {label && <span className="ml-auto text-xs">{label}</span>}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
