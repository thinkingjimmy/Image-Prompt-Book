/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 getActiveCategories，依赖 @/components/gallery 的 GalleryView/resolveListing，依赖 @/lib/seo
 * [OUTPUT]: 默认导出分类 Gallery，generateMetadata
 * [POS]: app/[locale]/(site) 的分类路由；只有存在已发布内容的分类可访问，其余真实 404
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryView, resolveListing } from "@/components/gallery/gallery-view";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { getActiveCategories } from "@/lib/content/catalog";
import { isIndexableListQuery, type RawSearchParams } from "@/lib/content/query";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { pageMetadata } from "@/lib/seo/metadata";
import { categoryPath, withLocale } from "@/lib/seo/urls";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "@/components/layout/json-ld";

type Props = { params: Promise<{ locale: Locale; category: string }>; searchParams: Promise<RawSearchParams> };

function findCategory(id: string) {
  return getActiveCategories().find((category) => category.id === id);
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const { category: id } = await params;
  const category = findCategory(id);
  if (!category) return {};
  const t = await getTranslations({ locale, namespace: "meta" });
  const { query, canonical } = resolveListing(await searchParams);
  const indexable = isIndexableListQuery(query);
  const base = t("categoryTitle", { category: category.labels[locale] });
  const title = !indexable ? t("searchTitle") : query.page > 1 ? `${t("pageSuffix", { page: query.page })} · ${base}` : base;
  return pageMetadata({ locale, title, description: category.descriptions[locale], path: categoryPath(id), search: canonical, indexable });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const locale = await requireLocale(params);
  const { category: id } = await params;
  setRequestLocale(locale);
  const category = findCategory(id);
  if (!category) notFound();
  const pages = await getTranslations({ locale, namespace: "pages" });
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: pages("breadcrumbHome"), url: absoluteUrl(withLocale(locale, "")) },
          { name: category.labels[locale], url: absoluteUrl(withLocale(locale, categoryPath(id))) },
        ])}
      />
      <GalleryView locale={locale} searchParams={await searchParams} category={{ id, label: category.labels[locale], description: category.descriptions[locale] }} />
    </>
  );
}
