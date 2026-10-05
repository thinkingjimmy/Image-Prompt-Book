/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 findCollection/findCollectionRedirect/getVisibleCollections，依赖 @/components/collections 的 CollectionView，依赖 @/lib/seo（Article + ItemList + BreadcrumbList）
 * [OUTPUT]: 默认导出专题页，generateMetadata，generateStaticParams
 * [POS]: app/[locale]/(site) 的 /collections/<slug> 路由：可索引、self-canonical、双语 hreflang；未知/草稿/成员不足 404，登记过的旧 slug 永久重定向
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CollectionView } from "@/components/collections/collection-view";
import { JsonLd } from "@/components/layout/json-ld";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { collectionContentFor, contentFor, findCollection, findCollectionRedirect, getVisibleCollections } from "@/lib/content/catalog";
import { collectionMetadata } from "@/lib/seo/metadata";
import { articleJsonLd, breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { collectionPath, collectionsPath, promptPath, withLocale } from "@/lib/seo/urls";
import { absoluteUrl, CURATOR_NAME, mediaUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return getVisibleCollections().map((view) => ({ slug: view.collection.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const { slug } = await params;
  const view = findCollection(slug);
  return view ? collectionMetadata(view, locale) : {};
}

export default async function CollectionPage({ params }: Props) {
  const locale = await requireLocale(params);
  const { slug } = await params;
  setRequestLocale(locale);
  const view = findCollection(slug);
  if (!view) {
    const moved = findCollectionRedirect(slug);
    if (moved) permanentRedirect(withLocale(locale, collectionPath(moved)));
    notFound();
  }

  const content = collectionContentFor(view.collection, locale);
  const t = await getTranslations({ locale, namespace: "collections" });
  const pages = await getTranslations({ locale, namespace: "pages" });
  const url = absoluteUrl(withLocale(locale, collectionPath(slug)));
  const cover = view.cover.examples[0]!;

  return (
    <>
      <JsonLd
        data={[
          articleJsonLd({
            locale,
            headline: content.heading,
            description: content.lead,
            url,
            datePublished: view.collection.meta.publishedAt,
            dateModified: view.collection.meta.updatedAt,
            author: CURATOR_NAME,
            image: absoluteUrl(mediaUrl(view.cover.meta.slug, cover.src)),
            items: view.members.map((entry) => ({ name: contentFor(entry, locale).title, url: absoluteUrl(withLocale(locale, promptPath(entry.meta.slug))) })),
          }),
          breadcrumbJsonLd([
            { name: pages("breadcrumbHome"), url: absoluteUrl(withLocale(locale, "")) },
            { name: t("breadcrumb"), url: absoluteUrl(withLocale(locale, collectionsPath())) },
            { name: content.title, url },
          ]),
        ]}
      />
      <CollectionView view={view} locale={locale} />
    </>
  );
}
