/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 getVisibleCollections/collectionsInCategory/getLibrary，依赖 @/lib/analytics/attribution 保留活动参数，依赖 @/components/collections 的 CollectionIndex，依赖 @/lib/seo
 * [OUTPUT]: 默认导出专题列表页，generateMetadata（无筛选 index；?category= 筛选 noindex,follow）
 * [POS]: app/[locale]/(site) 的 /collections 路由；没有可见专题时真实 404，未知参数或空分类 307 回到全部专题（保留 UTM 等归因参数）
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CollectionIndex } from "@/components/collections/collection-index";
import { JsonLd } from "@/components/layout/json-ld";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { attributionParams, isAttributionParam } from "@/lib/analytics/attribution";
import { collectionContentFor, collectionsInCategory, getLibrary, getVisibleCollections } from "@/lib/content/catalog";
import type { RawSearchParams } from "@/lib/content/query";
import { pageMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, collectionJsonLd } from "@/lib/seo/structured-data";
import { collectionPath, collectionsPath, withLocale } from "@/lib/seo/urls";
import { absoluteUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> };

/** The only list state is one category that actually has collections; campaign attribution is not list state. */
function resolveCategory(params: RawSearchParams) {
  const keys = Object.keys(params).filter((key) => !isAttributionParam(key));
  const raw = Array.isArray(params.category) ? params.category[0] : params.category;
  if (raw === undefined) return { valid: keys.length === 0, category: undefined };
  const category = getLibrary().taxonomy.categories.find((item) => item.id === raw);
  const valid = Boolean(category) && collectionsInCategory(raw).length > 0 && keys.length === 1 && !Array.isArray(params.category);
  return { valid, category: valid ? category : undefined };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  const { category } = resolveCategory(await searchParams);
  return pageMetadata({
    locale,
    title: category ? t("collectionsCategoryTitle", { category: category.labels[locale] }) : t("collectionsTitle"),
    description: t("collectionsDescription"),
    path: collectionsPath(),
    search: category ? `?category=${category.id}` : "",
    indexable: !category,
  });
}

export default async function CollectionsPage({ params, searchParams }: Props) {
  const locale = await requireLocale(params);
  setRequestLocale(locale);
  if (getVisibleCollections().length === 0) notFound();
  const raw = await searchParams;
  const { valid, category } = resolveCategory(raw);
  if (!valid) {
    const kept = attributionParams(raw);
    redirect(`${withLocale(locale, collectionsPath())}${kept.size ? `?${kept}` : ""}`);
  }

  const t = await getTranslations({ locale, namespace: "collections" });
  const meta = await getTranslations({ locale, namespace: "meta" });
  const pages = await getTranslations({ locale, namespace: "pages" });
  const views = collectionsInCategory(category?.id);
  const url = absoluteUrl(withLocale(locale, collectionsPath()));
  return (
    <>
      <JsonLd
        data={[
          collectionJsonLd({
            locale,
            name: t("indexHeading"),
            description: meta("collectionsDescription"),
            url,
            items: views.map((view) => ({ name: collectionContentFor(view.collection, locale).heading, url: absoluteUrl(withLocale(locale, collectionPath(view.collection.meta.slug))) })),
          }),
          breadcrumbJsonLd([
            { name: pages("breadcrumbHome"), url: absoluteUrl(withLocale(locale, "")) },
            { name: t("breadcrumb"), url },
          ]),
        ]}
      />
      <CollectionIndex locale={locale} views={views} category={category ? { id: category.id, label: category.labels[locale] } : undefined} />
    </>
  );
}
