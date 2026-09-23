/**
 * [INPUT]: 依赖 @/i18n/config 的 LOCALES/Locale，依赖 @/lib/content/query 的 listQueryToSearch，依赖 @/lib/site 的 absoluteUrl
 * [OUTPUT]: 对外提供 homePath/categoryPath/promptPath/staticPath/listHref/localizedAlternates()
 * [POS]: lib/seo 的 URL 规范单一来源；canonical、hreflang、sitemap、分页与卡片链接都由此生成，保证同一状态只有一个网址
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";
import { listQueryToSearch, type ListQuery } from "@/lib/content/query";
import { absoluteUrl } from "@/lib/site";

export type StaticPage = "about" | "contribute" | "licenses";

/** Paths without the locale prefix; `withLocale` adds it. */
export const homePath = () => "";
export const categoryPath = (category: string) => `/categories/${category}`;
export const promptPath = (slug: string) => `/prompts/${slug}`;
export const staticPath = (page: StaticPage) => `/${page}`;

export function withLocale(locale: Locale, path: string): string {
  return `/${locale}${path}`;
}

export function listHref(locale: Locale, query: Partial<ListQuery>, category?: string): string {
  return `${withLocale(locale, category ? categoryPath(category) : homePath())}${listQueryToSearch(query)}`;
}

/** Self-canonical per locale plus hreflang for every real translation and x-default → English. */
export function localizedAlternates(locale: Locale, path: string, search = "", locales: readonly Locale[] = LOCALES) {
  const languages: Record<string, string> = {};
  for (const item of locales) languages[item] = absoluteUrl(`${withLocale(item, path)}${search}`);
  if (locales.includes(DEFAULT_LOCALE)) languages["x-default"] = absoluteUrl(`${withLocale(DEFAULT_LOCALE, path)}${search}`);
  return { canonical: absoluteUrl(`${withLocale(locale, path)}${search}`), languages };
}
