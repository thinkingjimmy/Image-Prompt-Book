/**
 * [INPUT]: Visible collections (optionally one category) and per-category counts from the catalog, localized messages, CollectionCard, composed FooterLead and the collections path.
 * [OUTPUT]: CollectionIndex (category chip row with counts, card grid, Line footer H1) and CollectionIndexLink (one crawlable index entry).
 * [POS]: Body of /collections and the compact crawlable index entry from gallery pages; like the gallery toolbar, a single chip row above the grid is the only filter.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ArrowRight } from "lucide-react";
import { FooterLead } from "@/components/layout/site-footer";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { collectionsInCategory, getLibrary, getVisibleCollections, type CollectionView } from "@/lib/content/catalog";
import { collectionsPath } from "@/lib/seo/urls";
import { cn } from "@/lib/utils";
import { CollectionCard } from "./collection-card";

const CHIP = "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-[13px] font-medium whitespace-nowrap transition-colors";

export async function CollectionIndex({ locale, views, category }: { locale: Locale; views: CollectionView[]; category?: { id: string; label: string } }) {
  const t = await getTranslations({ locale, namespace: "collections" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const heading = category ? t("categoryCollections", { category: category.label }) : t("indexHeading");
  const chips = [
    { id: "", label: nav("allCollections"), count: getVisibleCollections().length },
    ...getLibrary()
      .taxonomy.categories.map((item) => ({ id: item.id, label: item.labels[locale], count: collectionsInCategory(item.id).length }))
      .filter((item) => item.count > 0),
  ];
  const active = category?.id ?? "";

  return (
    <>
      <div className="mx-auto mb-8 w-full max-w-[1800px] px-4 pt-2 sm:px-6 lg:px-8">
        <nav aria-label={nav("filterCollections")} className="mb-5 flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {chips.map((item) => (
            <Link
              key={item.id || "all"}
              href={{ pathname: collectionsPath(), query: item.id ? { category: item.id } : {} }}
              aria-current={active === item.id ? "page" : undefined}
              className={cn(CHIP, active === item.id ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground/80 hover:border-foreground/30 hover:text-foreground")}
            >
              {item.label}
              <span className={cn("text-xs tabular-nums", active === item.id ? "text-background/70" : "text-muted-foreground")}>{item.count}</span>
            </Link>
          ))}
        </nav>
        <ul className="grid grid-cols-2 gap-x-3 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
          {views.map((view) => (
            <CollectionCard key={view.collection.meta.slug} view={view} locale={locale} />
          ))}
        </ul>
      </div>
      <FooterLead title={heading} />
    </>
  );
}

/** One crawlable collection-index entry beside the gallery's closing heading. */
export async function CollectionIndexLink({ locale }: { locale: Locale }) {
  if (getVisibleCollections().length === 0) return null;
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <Link href={collectionsPath()} className="inline-flex min-h-11 items-center gap-2 justify-self-start rounded-lg text-[13px] font-medium hover:underline hover:underline-offset-4 sm:justify-self-end">
      {t("allCollections")}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}
