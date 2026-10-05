/**
 * [INPUT]: Active categories/collection availability, site repository/author URLs and shared sidebar components.
 * [OUTPUT]: sidebarData() and SiteSidebar, the server-rendered 240px desktop navigation.
 * [POS]: Warm Canvas navigation with left-aligned X/GitHub/language/About utilities; MobileNav uses the same data below lg.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Locale } from "@/i18n/config";
import { getActiveCategories, getVisibleCollections } from "@/lib/content/catalog";
import { AUTHOR_X_URL, REPO_URL } from "@/lib/site";
import { SidebarActions, SidebarBrand, SidebarNav, type SidebarData } from "./sidebar-nav";

export function sidebarData(locale: Locale): SidebarData {
  return {
    categories: getActiveCategories().map((category) => ({ id: category.id, label: category.labels[locale], count: category.count })),
    hasCollections: getVisibleCollections().length > 0,
    repoUrl: REPO_URL,
    xUrl: AUTHOR_X_URL[locale],
  };
}

export function SiteSidebar({ locale }: { locale: Locale }) {
  const data = sidebarData(locale);
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-sidebar px-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] lg:flex">
      <SidebarBrand />
      <div className="-mx-2 mt-4 min-h-0 flex-1 overflow-y-auto px-2 pt-1.5 pb-4 [scrollbar-width:none]">
        <SidebarNav {...data} />
      </div>
      <SidebarActions repoUrl={data.repoUrl} xUrl={data.xUrl} />
    </aside>
  );
}
