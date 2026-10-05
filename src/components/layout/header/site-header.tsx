/**
 * [INPUT]: Localized navigation messages, active category labels, query limits, Search icon, PageTitle/SearchBox and the shared mobile sidebar.
 * [OUTPUT]: SiteHeader, a viewport-inset section label and expandable icon search with a narrow-screen navigation trigger.
 * [POS]: Canvas header with a native GET search fallback before hydration or without JS; categories belong to the sidebar and tag/sort controls to the gallery.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import { Search } from "lucide-react";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { getActiveCategories } from "@/lib/content/catalog";
import { MAX_QUERY_LENGTH } from "@/lib/content/query";
import { MobileNav } from "../sidebar/mobile-nav";
import { sidebarData } from "../sidebar/site-sidebar";
import { PageTitle } from "./page-title";
import { SearchBox } from "./search-box";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const categories = getActiveCategories().map((category) => ({ id: category.id, label: category.labels[locale] }));

  return (
    <header className="site-header">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        {t("skip")}
      </a>
      <div className="mx-auto flex h-16 max-w-[1800px] items-center gap-3 px-4 sm:px-6 lg:h-[72px] lg:px-8">
        <MobileNav {...sidebarData(locale)} />
        <div className="min-w-0 flex-1">
          <PageTitle categories={categories} />
        </div>
        <Suspense fallback={
          <div className="site-search site-search-fallback">
            <span aria-hidden className="site-control site-icon-control site-search-trigger text-muted-foreground"><Search className="size-4" strokeWidth={1.7} /></span>
            <form role="search" action={`/${locale}`} method="get" className="site-search-form">
              <label htmlFor="site-search-fallback" className="sr-only">{t("search")}</label>
              <Search aria-hidden className="pointer-events-none absolute left-3 size-4 text-muted-foreground" strokeWidth={1.7} />
              <input id="site-search-fallback" name="q" type="search" maxLength={MAX_QUERY_LENGTH} placeholder={t("searchPlaceholder")} className="h-11 w-full rounded-lg bg-transparent pr-3 pl-10 text-base" />
            </form>
          </div>
        }>
          <SearchBox />
        </Suspense>
      </div>
    </header>
  );
}
