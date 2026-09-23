/**
 * [INPUT]: 依赖 @/lib/site 的 absoluteUrl/SITE_NAME/REPO_URL
 * [OUTPUT]: 对外提供 websiteJsonLd/collectionJsonLd/breadcrumbJsonLd/creativeWorkJsonLd 与 serializeJsonLd()
 * [POS]: lib/seo 的结构化数据构建器；只描述页面上真实存在的事实，不输出评分、评论或下载量
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Locale } from "@/i18n/config";
import { absoluteUrl, REPO_URL, SITE_NAME } from "@/lib/site";

type Json = Record<string, unknown>;

/** Escapes `<` so content can never close the script element. */
export function serializeJsonLd(data: Json | Json[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function websiteJsonLd(locale: Locale, description: string): Json {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: absoluteUrl(`/${locale}`),
    inLanguage: locale,
    description,
    sameAs: [REPO_URL],
  };
}

export function collectionJsonLd(input: { locale: Locale; name: string; description: string; url: string; items: { name: string; url: string }[] }): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: input.items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, url: item.url })),
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): Json {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: item.name, item: item.url })),
  };
}

export function creativeWorkJsonLd(input: {
  locale: Locale;
  name: string;
  description: string;
  url: string;
  text: string;
  license: string;
  dateCreated: string;
  dateModified: string;
  datePublished: string | null;
  author: { name: string; url?: string } | null;
  basedOn: string;
  images: { url: string; width: number; height: number; caption: string }[];
}): Json {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: input.name,
    description: input.description,
    url: input.url,
    inLanguage: input.locale,
    text: input.text,
    license: input.license,
    dateCreated: input.dateCreated,
    dateModified: input.dateModified,
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.author ? { author: { "@type": "Person", name: input.author.name, ...(input.author.url ? { url: input.author.url } : {}) } } : {}),
    isBasedOn: input.basedOn,
    publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
    ...(input.images.length
      ? { image: input.images.map((image) => ({ "@type": "ImageObject", contentUrl: image.url, width: image.width, height: image.height, caption: image.caption })) }
      : {}),
  };
}
