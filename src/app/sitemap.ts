/**
 * [INPUT]: Published entries/collections, active categories, locale configuration and shared SEO paths.
 * [OUTPUT]: sitemap.xml with localized galleries, prompts, collections, About/Licenses and reciprocal hreflang.
 * [POS]: App indexation map; uses real content dates and omits filters, drafts, fixtures and retired routes.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { MetadataRoute } from "next";
import { LOCALES, type Locale } from "@/i18n/config";
import { getActiveCategories, getVisibleCollections, getVisibleEntries } from "@/lib/content/catalog";
import { categoryPath, collectionPath, collectionsPath, localizedAlternates, promptPath, staticPath } from "@/lib/seo/urls";

export default function sitemap(): MetadataRoute.Sitemap {
  // Draft previews are a local-only convenience and never reach the sitemap.
  const entries = getVisibleEntries().filter((entry) => entry.meta.status === "published");
  const collections = getVisibleCollections().filter((view) => view.collection.meta.status === "published");
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
    ...(collections.length ? page(collectionsPath(), latest(collections.map((view) => view.collection.meta.updatedAt))) : []),
    ...collections.flatMap((view) => page(collectionPath(view.collection.meta.slug), view.collection.meta.updatedAt)),
    ...(["about", "licenses"] as const).flatMap((name) => page(staticPath(name))),
  ];
}
