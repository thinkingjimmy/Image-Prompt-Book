/**
 * [INPUT]: 依赖 @/components/gallery 的 GalleryView/resolveListing，依赖 @/lib/seo 的 pageMetadata/websiteJsonLd
 * [OUTPUT]: 默认导出 Gallery 首页，generateMetadata（索引矩阵：默认排序分页 self-canonical，筛选 noindex）
 * [POS]: app/[locale]/(site) 的首页路由
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { GalleryView, resolveListing } from "@/components/gallery/gallery-view";
import { JsonLd } from "@/components/layout/json-ld";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { isIndexableListQuery, type RawSearchParams } from "@/lib/content/query";
import { pageMetadata } from "@/lib/seo/metadata";
import { websiteJsonLd } from "@/lib/seo/structured-data";

type Props = { params: Promise<{ locale: Locale }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const t = await getTranslations({ locale, namespace: "meta" });
  const { query, canonical } = resolveListing(await searchParams);
  const indexable = isIndexableListQuery(query);
  const title = !indexable ? t("searchTitle") : query.page > 1 ? `${t("pageSuffix", { page: query.page })} · ${t("homeTitle")}` : t("homeTitle");
  return pageMetadata({ locale, title, description: t("homeDescription"), path: "", search: canonical, indexable });
}

export default async function HomePage({ params, searchParams }: Props) {
  const locale = await requireLocale(params);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "meta" });
  return (
    <>
      <JsonLd data={websiteJsonLd(locale, t("homeDescription"))} />
      <GalleryView locale={locale} searchParams={await searchParams} />
    </>
  );
}
