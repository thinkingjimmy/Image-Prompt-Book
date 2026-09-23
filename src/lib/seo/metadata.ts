/**
 * [INPUT]: 依赖 next 的 Metadata 类型，依赖 ./urls 的 localizedAlternates，依赖 @/lib/site 的 isProductionDeploy/siteUrl/SITE_NAME
 * [OUTPUT]: 对外提供 pageMetadata()/promptMetadata()，统一 title/description/canonical/hreflang/robots/OG
 * [POS]: lib/seo 的 metadata 工厂；首页、分类、详情、说明页与弹窗共用，避免各页各写一套索引规则
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { LOCALES, type Locale } from "@/i18n/config";
import { contentFor } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";
import { absoluteUrl, isProductionDeploy, mediaUrl, SITE_NAME, siteUrl } from "@/lib/site";
import { localizedAlternates, promptPath } from "./urls";

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
      locale: locale.replace("-", "_"),
      ...(image ? { images: [image] } : {}),
    },
    twitter: { card: image ? "summary_large_image" : "summary", title, description },
  };
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
    // Only reviewed, approved example images ever reach share cards.
    image: cover ? { url: absoluteUrl(mediaUrl(entry.meta.slug, cover.src)), width: cover.width, height: cover.height, alt: cover.alt[locale] } : undefined,
  });
}
