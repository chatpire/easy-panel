import { usePathname } from "next/navigation";

export default function useCheckActiveNav() {
  const path = usePathname();
  const checkActiveNav = (nav: string | undefined) => {
    // if (!nav) return false;
    // const pathArray = path.split("/").filter((item) => item !== "");
    // if (nav === "/" && pathArray.length < 1) return true;
    // return pathArray.includes(nav.replace(/^\//, ""));
    return path === nav;
  };

  return { checkActiveNav };
}
