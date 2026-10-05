/**
 * [INPUT]: 依赖 next 的 Metadata 类型，依赖 @/lib/content/catalog 的 contentFor/collectionContentFor，依赖 ./urls 的 localizedAlternates，依赖 @/lib/site 的 isProductionDeploy/siteUrl/SITE_NAME
 * [OUTPUT]: 对外提供 pageMetadata()/promptMetadata()/collectionMetadata()，统一 title/description/canonical/hreflang/robots/OG（无封面时用 /media/og.png 站点分享图；专题用封面成员的首张示例图）
 * [POS]: lib/seo 的 metadata 工厂；首页、分类、详情、专题、说明页与弹窗共用，避免各页各写一套索引规则
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/i18n/config";
import { collectionContentFor, contentFor, type CollectionView } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";
import { absoluteUrl, isProductionDeploy, mediaUrl, SITE_NAME, siteUrl } from "@/lib/site";
import { collectionPath, localizedAlternates, promptPath } from "./urls";

/** Site share card from app/media/og.png; pages without their own cover use it. */
const DEFAULT_IMAGE = { url: "/media/og.png", width: 1200, height: 630, alt: SITE_NAME };
// Open Graph wants language_TERRITORY.
const OG_LOCALES: Record<Locale, string> = { en: "en_US", "zh-CN": "zh_CN" };

type PageMetadataInput = {
  locale: Locale;
  title: string;
  description: string;
  /** Locale-less path, e.g. `/prompts/foo`. */
  path: string;
  /** Normalized query string (with `?`) that is part of the canonical URL. */
  search?: string;
  /** Filtered/sorted listings are noindex,follow; everything else follows the deploy default. */
  indexable?: boolean;
  /** Only include translations that really exist. */
  locales?: readonly Locale[];
  image?: { url: string; width: number; height: number; alt: string };
  type?: "website" | "article";
};

export function pageMetadata({ locale, title, description, path, search = "", indexable = true, locales, image, type = "website" }: PageMetadataInput): Metadata {
  const alternates = localizedAlternates(locale, path, search, locales);
  return {
    metadataBase: siteUrl(),
    title: { absolute: title },
    description,
    alternates: indexable ? alternates : { canonical: alternates.canonical },
    // Previews are never indexable; in production only filtered listings are noindex (still followed).
    robots: isProductionDeploy() ? { index: indexable, follow: true } : { index: false, follow: false },
    openGraph: {
      type,
      siteName: SITE_NAME,
      title,
      description,
      url: alternates.canonical,
      locale: OG_LOCALES[locale],
      alternateLocale: (locales ?? LOCALES).filter((item) => item !== locale).map((item) => OG_LOCALES[item]),
      images: [image ?? DEFAULT_IMAGE],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export function collectionMetadata(view: CollectionView, locale: Locale): Metadata {
  const content = collectionContentFor(view.collection, locale);
  const cover = view.cover.examples[0];
  return pageMetadata({
    locale,
    title: content.seoTitle,
    description: content.lead,
    path: collectionPath(view.collection.meta.slug),
    type: "article",
    image: cover ? { url: absoluteUrl(mediaUrl(view.cover.meta.slug, cover.src)), width: cover.width, height: cover.height, alt: cover.alt[locale] } : undefined,
  });
}

/** Detail metadata shared by the standalone page and the intercepted modal. */
export function promptMetadata(entry: PromptEntry, locale: Locale): Metadata {
  const content = contentFor(entry, locale);
  const cover = entry.examples[0];
  return pageMetadata({
    locale,
    title: content.seoTitle,
    description: content.seoDescription,
    path: promptPath(entry.meta.slug),
    locales: LOCALES.filter((item) => entry.content[item]),
    type: "article",
    image: cover ? { url: absoluteUrl(mediaUrl(entry.meta.slug, cover.src)), width: cover.width, height: cover.height, alt: cover.alt[locale] } : undefined,
  });
}
