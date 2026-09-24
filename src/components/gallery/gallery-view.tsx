/**
 * [INPUT]: 依赖 @/lib/content 的 catalog/query（筛选、排序、分页、规范化），依赖同目录 PromptCard/ListControls，依赖 @/lib/seo 的 URL 与 JSON-LD
 * [OUTPUT]: 对外提供 GalleryView 服务端组件与 resolveListing()（页面与 metadata 共用的列表解析）
 * [POS]: components/gallery 的列表主视图，被首页与分类页复用；负责非规范 URL 重定向、超范围 404、空态与分页；页面 H1 与介绍放在列表之后、作为页脚首段（data-footer-lead），网格上方不加任何内容
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import type { Locale } from "@/i18n/config";
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
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) search.append(key, item);
  }
  const text = search.toString();
  return text ? `?${text}` : "";
}

/** Parses list params against the taxonomy; `canonical` is the only accepted spelling of this state. */
export function resolveListing(params: RawSearchParams) {
  const knownTags = getLibrary().taxonomy.tags.map((tag) => tag.id);
  const query = parseListQuery(params, knownTags);
  const canonical = listQueryToSearch(query);
  return { query, canonical, isCanonical: canonical === rawSearch(params) };
}

type GalleryViewProps = {
  locale: Locale;
  searchParams: RawSearchParams;
  category?: { id: string; label: string; description: string };
};

export async function GalleryView({ locale, searchParams, category }: GalleryViewProps) {
  const t = await getTranslations({ locale, namespace: "gallery" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const { query, isCanonical } = resolveListing(searchParams);
  if (!isCanonical) redirect(listHref(locale, query, category?.id));

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
