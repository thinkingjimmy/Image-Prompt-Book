/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 getVisibleEntries/getActiveCategories，依赖 @/lib/seo/urls，依赖 @/lib/site
 * [OUTPUT]: 默认导出 sitemap.xml（各语言首页、有内容的分类、已发布详情、说明页 + hreflang alternates）
 * [POS]: app 的站点地图；与列表/详情共用同一发布谓词，只使用内容的真实修改日期，不含筛选页、草稿或 fixture
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { MetadataRoute } from "next";
import { LOCALES, type Locale } from "@/i18n/config";
import { getActiveCategories, getVisibleEntries } from "@/lib/content/catalog";
import { categoryPath, localizedAlternates, promptPath, staticPath } from "@/lib/seo/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  // Draft previews are a local-only convenience and never reach the sitemap.
  const entries = getVisibleEntries().filter((entry) => entry.meta.status === "published");
  const latest = (dates: string[]) => dates.sort().at(-1);

  const page = (path: string, lastModified?: string, locales: readonly Locale[] = LOCALES) =>
    locales.map((locale) => {
      const alternates = localizedAlternates(locale, path, "", locales);
      return { url: alternates.canonical, ...(lastModified ? { lastModified } : {}), alternates: { languages: alternates.languages } };
    });

  return [
    ...page("", latest(entries.map((entry) => entry.meta.updatedAt))),
    ...getActiveCategories().flatMap((category) =>
      page(categoryPath(category.id), latest(entries.filter((entry) => entry.meta.category === category.id).map((entry) => entry.meta.updatedAt))),
    ),
    ...entries.flatMap((entry) => page(promptPath(entry.meta.slug), entry.meta.updatedAt, LOCALES.filter((locale) => entry.content[locale]))),
    ...(["about", "contribute", "licenses"] as const).flatMap((name) => page(staticPath(name))),
  ];
}
