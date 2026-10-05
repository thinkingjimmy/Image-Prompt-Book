/**
 * [INPUT]: Content catalog/query (including collections), analytics attribution parsing, gallery cards/controls, collection cards/index link and Line FooterLead and SEO URLs/JSON-LD.
 * [OUTPUT]: GalleryView and resolveListing() with separate canonical state and attribution-preserving landing search.
 * [POS]: Shared homepage/category gallery; normalizes list URLs, preserves campaign attribution, shows the tag/sort toolbar above the grid (an @container for masonry columns), slots collection cards into the unfiltered first page and keeps the compact visible heading/index link after the grid.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
import { attributionParams, isAttributionParam } from "@/lib/analytics/attribution";
import { contentFor, featuredCollections, getLibrary, getVisibleEntries, queryCatalog } from "@/lib/content/catalog";
import { listQueryToSearch, parseListQuery, type RawSearchParams } from "@/lib/content/query";
import { absoluteUrl } from "@/lib/site";
import { collectionJsonLd } from "@/lib/seo/structured-data";
import { listHref, promptPath, withLocale } from "@/lib/seo/urls";
import { CollectionCard } from "@/components/collections/collection-card";
import { CollectionIndexLink } from "@/components/collections/collection-index";
import { FooterLead } from "@/components/layout/site-footer";
import { JsonLd } from "@/components/layout/json-ld";
import { EmptyState, ListToolbar, Pagination } from "./list-controls";
import { PromptCard } from "./prompt-card";

/** Prompt-card positions a collection card is placed before. Index 0 stays a prompt: it is the eager LCP image. */
const COLLECTION_SLOTS = [2, 10, 18];

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
  const { query, landingSearch, isCanonical } = resolveListing(searchParams);
  if (!isCanonical) redirect(`${listHref(locale, {}, category?.id)}${landingSearch}`);

  const result = queryCatalog(query, category?.id);
  if (result.outOfRange) notFound();

  const library = getLibrary();
  const scope = getVisibleEntries().filter((entry) => !category || entry.meta.category === category.id);
  const availableTags = library.taxonomy.tags.filter((tag) => query.tags.includes(tag.id) || scope.some((entry) => entry.meta.tags.includes(tag.id)));
  const filtered = Boolean(query.q || query.tags.length);
  const catalogEmpty = scope.length === 0;
  // Collection cards join only the unfiltered first page; they never count toward the page size or the ItemList.
  const collections = featuredCollections(category?.id);
  const slotted = !filtered && query.page === 1 ? collections : [];
  const heading = category ? category.label : t("heading");
  const intro = category ? t("categoryIntro", { description: category.description }) : t("intro");

  return (
    <>
      {/* w-full: main becomes a column flexbox on gallery pages, where auto margins alone would shrink this box. */}
      <div className="@container mx-auto mb-8 w-full max-w-[1800px] px-4 pt-2 sm:px-6 lg:px-8">
        <JsonLd
          data={collectionJsonLd({
            locale,
            name: heading,
            description: intro,
            url: absoluteUrl(listHref(locale, { page: query.page }, category?.id)),
            items: result.items.map((entry) => ({ name: contentFor(entry, locale).title, url: absoluteUrl(withLocale(locale, promptPath(entry.meta.slug))) })),
          })}
        />

        {!catalogEmpty && (
          <ListToolbar locale={locale} tags={availableTags.map((tag) => ({ id: tag.id, label: tag.labels[locale] }))} query={query} category={category?.id} total={result.total} />
        )}

        {catalogEmpty ? (
          <EmptyState title={t("catalogEmptyTitle")} body={t("catalogEmptyBody")} />
        ) : result.total === 0 ? (
          <EmptyState
            title={t("emptyTitle")}
            body={t("emptyBody")}
            action={filtered ? { label: t("clearFilters"), href: listHref(locale, { sort: query.sort }, category?.id) } : undefined}
          />
        ) : (
          <>
            <ul className="masonry" aria-label={t("results", { count: result.total })}>
              {result.items.flatMap((entry, index) => {
                const card = <PromptCard key={entry.meta.slug} entry={entry} locale={locale} eager={index === 0} />;
                const slot = COLLECTION_SLOTS.indexOf(index);
                const view = slot >= 0 ? slotted[slot] : undefined;
                return view ? [<CollectionCard key={`collection-${view.collection.meta.slug}`} view={view} locale={locale} />, card] : [card];
              })}
            </ul>
            <Pagination locale={locale} query={query} category={category?.id} totalPages={result.totalPages} />
          </>
        )}
      </div>
      <FooterLead title={heading}>
        <CollectionIndexLink locale={locale} />
      </FooterLead>
    </>
  );
}
