/**
 * [INPUT]: Content catalog/query, analytics attribution parsing, gallery cards/controls and SEO URLs/JSON-LD.
 * [OUTPUT]: GalleryView and resolveListing() with separate canonical state and attribution-preserving landing search.
 * [POS]: Shared homepage/category gallery; normalizes list URLs, preserves campaign attribution and keeps the visible heading after the grid.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { attributionParams, isAttributionParam } from "@/lib/analytics/attribution";
import { contentFor, getLibrary, getVisibleEntries, queryCatalog } from "@/lib/content/catalog";
import { listQueryToSearch, parseListQuery, type RawSearchParams } from "@/lib/content/query";
import { absoluteUrl } from "@/lib/site";
import { collectionJsonLd } from "@/lib/seo/structured-data";
import { listHref, promptPath, withLocale } from "@/lib/seo/urls";
import { JsonLd } from "@/components/layout/json-ld";
import { EmptyState, Pagination, TagFilters } from "./list-controls";
import { PromptCard } from "./prompt-card";

function rawSearch(params: RawSearchParams): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (isAttributionParam(key)) continue;
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) search.append(key, item);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Canonical list state excludes campaign attribution; normalization redirects retain allowed attribution. */
export function resolveListing(params: RawSearchParams) {
  const knownTags = getLibrary().taxonomy.tags.map((tag) => tag.id);
  const query = parseListQuery(params, knownTags);
  const canonical = listQueryToSearch(query);
  const landing = new URLSearchParams(canonical);
  for (const [key, value] of attributionParams(params)) landing.set(key, value);
  const landingSearch = landing.size ? `?${landing}` : "";
  return { query, canonical, landingSearch, isCanonical: canonical === rawSearch(params) };
}

type GalleryViewProps = {
  locale: Locale;
  searchParams: RawSearchParams;
  category?: { id: string; label: string; description: string };
};

export async function GalleryView({ locale, searchParams, category }: GalleryViewProps) {
  const t = await getTranslations({ locale, namespace: "gallery" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const { query, landingSearch, isCanonical } = resolveListing(searchParams);
  if (!isCanonical) redirect(`${listHref(locale, {}, category?.id)}${landingSearch}`);

  const result = queryCatalog(query, category?.id);
  if (result.outOfRange) notFound();

  const library = getLibrary();
  const scope = getVisibleEntries().filter((entry) => !category || entry.meta.category === category.id);
  const availableTags = library.taxonomy.tags.filter((tag) => scope.some((entry) => entry.meta.tags.includes(tag.id)));
  const filtered = Boolean(query.q || query.tags.length);
  const catalogEmpty = scope.length === 0;
  const heading = category ? category.label : t("heading");
  const intro = category ? t("categoryIntro", { description: category.description }) : t("intro");

  return (
    <>
      {/* w-full: main becomes a column flexbox on gallery pages, where auto margins alone would shrink this box. */}
      <div className="mx-auto mb-16 w-full max-w-[1800px] px-4 pt-2 sm:px-6 lg:px-8">
        <JsonLd
          data={collectionJsonLd({
            locale,
            name: heading,
            description: intro,
            url: absoluteUrl(listHref(locale, { page: query.page }, category?.id)),
            items: result.items.map((entry) => ({ name: contentFor(entry, locale).title, url: absoluteUrl(withLocale(locale, promptPath(entry.meta.slug))) })),
          })}
        />

        {filtered && !catalogEmpty && (
          <TagFilters locale={locale} tags={availableTags.map((tag) => ({ id: tag.id, label: tag.labels[locale] }))} query={query} category={category?.id} total={result.total} />
        )}

        {catalogEmpty ? (
          <EmptyState title={t("catalogEmptyTitle")} body={t("catalogEmptyBody")} action={{ label: nav("contribute"), href: withLocale(locale, "/contribute") }} />
        ) : result.total === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={filtered ? { label: t("clearFilters"), href: listHref(locale, { sort: query.sort }, category?.id) } : undefined}
          />
        ) : (
          <>
            <ul className="masonry" aria-label={t("results", { count: result.total })}>
              {result.items.map((entry, index) => (
                <PromptCard key={entry.meta.slug} entry={entry} locale={locale} taxonomy={library.taxonomy} eager={index < 4} />
              ))}
            </ul>
            <Pagination locale={locale} query={query} category={category?.id} totalPages={result.totalPages} />
          </>
        )}
      </div>
      {/* Image-first like jevable.com: nothing sits above the grid. The page's heading opens the footer instead,
          visible to everyone; SiteFooter drops its own top rule when this lead is present. */}
      <section data-footer-lead className="mt-auto border-t border-border/60">
        <div className="mx-auto flex max-w-[1800px] flex-col gap-1 px-4 pt-8 sm:px-6 lg:px-8">
          <h1 className="text-[15px] leading-snug font-semibold tracking-tight">{heading}</h1>
          <p className="max-w-xl text-sm text-muted-foreground">{intro}</p>
        </div>
      </section>
    </>
  );
}
