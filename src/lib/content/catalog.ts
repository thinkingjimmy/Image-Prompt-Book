/**
 * [INPUT]: 依赖 ./load 的 loadContentLibrary/publicationBlockers，依赖 ./collections 的 collectionBlockers，依赖 ./query 的筛选排序分页，依赖 @/lib/site 的 contentConfig
 * [OUTPUT]: 对外提供 getLibrary()/getVisibleEntries()/findEntry()/findRedirect()/getActiveCategories()/queryCatalog()/entryDate()/isVisible()，以及专题的 getVisibleCollections()/findCollection()/findCollectionRedirect()/collectionsInCategory()/featuredCollections()/collectionsWithMember()/collectionContentFor()、CollectionView 类型
 * [POS]: lib/content 的服务端目录门面；首页、分类、搜索、详情、专题、sitemap 全部经由 isVisible 这一个发布谓词取数；专题只显示可见成员，可见成员不足时整篇不可见
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { LOCALES, type Locale } from "@/i18n/config";
import { contentConfig } from "@/lib/site";
import { collectionBlockers, MIN_COLLECTION_MEMBERS, type CollectionEntry } from "./collections";
import { loadContentLibrary, publicationBlockers, type ContentLibrary, type PromptEntry } from "./load";
import { matchesQuery, paginate, sortItems, type ListQuery } from "./query";

let cached: ContentLibrary | null = null;

export function getLibrary(): ContentLibrary {
  // Development re-reads so content edits show without a restart; production loads once per process.
  if (cached && process.env.NODE_ENV === "production") return cached;
  const config = contentConfig();
  const library = loadContentLibrary({ root: config.root, allowFixtures: config.isFixture });
  if (library.issues.length > 0) {
    throw new Error(`Content validation failed:\n- ${library.issues.join("\n- ")}`);
  }
  cached = library;
  return library;
}

/** The single publication predicate. Draft previews exist only in local development with an explicit flag. */
export function isVisible(entry: PromptEntry): boolean {
  if (publicationBlockers(entry).length === 0) return true;
  return contentConfig().previewDrafts && entry.meta.status === "draft" && LOCALES.every((locale) => entry.content[locale] && entry.templates[locale]);
}

export function getVisibleEntries(): PromptEntry[] {
  return getLibrary().entries.filter(isVisible);
}

export function findEntry(slug: string): PromptEntry | undefined {
  return getVisibleEntries().find((entry) => entry.meta.slug === slug);
}

/** Resolves an old slug recorded in `redirectFrom` to its current visible entry. */
export function findRedirect(slug: string): string | undefined {
  return getVisibleEntries().find((entry) => entry.meta.redirectFrom?.includes(slug))?.meta.slug;
}

export function entryDate(entry: PromptEntry): string {
  return entry.meta.publishedAt ?? entry.meta.createdAt;
}

export function getActiveCategories() {
  const { taxonomy } = getLibrary();
  const entries = getVisibleEntries();
  return taxonomy.categories
    .map((category) => ({ ...category, count: entries.filter((entry) => entry.meta.category === category.id).length }))
    .filter((category) => category.count > 0);
}

function searchText(entry: PromptEntry, library: ContentLibrary): string {
  const category = library.taxonomy.categories.find((item) => item.id === entry.meta.category);
  const tags = library.taxonomy.tags.filter((tag) => entry.meta.tags.includes(tag.id));
  const parts: string[] = [entry.meta.slug, entry.meta.category, ...entry.meta.tags];
  for (const content of Object.values(entry.content)) parts.push(content.title, content.summary, ...(content.keywords ?? []));
  for (const term of [category, ...tags]) if (term) parts.push(...Object.values(term.labels));
  return parts.join(" \u0000 ");
}

export function queryCatalog(query: ListQuery, category?: string) {
  const library = getLibrary();
  const matches = getVisibleEntries().filter(
    (entry) =>
      (!category || entry.meta.category === category) &&
      query.tags.every((tag) => entry.meta.tags.includes(tag)) &&
      matchesQuery(searchText(entry, library), query.q),
  );
  const sorted = sortItems(
    matches.map((entry) => ({ slug: entry.meta.slug, featuredRank: entry.meta.featuredRank ?? null, date: entryDate(entry), entry })),
    query.sort,
  ).map((item) => item.entry);
  return paginate(sorted, query.page);
}

export function contentFor(entry: PromptEntry, locale: Locale) {
  const content = entry.content[locale];
  if (!content) throw new Error(`${entry.meta.slug} has no ${locale} content`);
  return content;
}

/** A visible collection with only its visible members; groups left empty are dropped. */
export type CollectionView = {
  collection: CollectionEntry;
  members: PromptEntry[];
  groups: { id: string; members: PromptEntry[] }[];
  cover: PromptEntry;
};

function viewOf(collection: CollectionEntry): CollectionView | null {
  const visible = new Map(getVisibleEntries().map((entry) => [entry.meta.slug, entry]));
  const groups = collection.meta.groups
    .map((group) => ({ id: group.id, members: group.members.flatMap((slug) => visible.get(slug) ?? []) }))
    .filter((group) => group.members.length > 0);
  const members = groups.flatMap((group) => group.members);
  if (members.length < MIN_COLLECTION_MEMBERS) return null;
  const published = collectionBlockers(collection, new Set(visible.keys())).length === 0;
  const preview = contentConfig().previewDrafts && collection.meta.status === "draft" && LOCALES.every((locale) => collection.content[locale]);
  if (!published && !preview) return null;
  return { collection, members, groups, cover: visible.get(collection.meta.cover) ?? members[0]! };
}

/** Newest first: a substantive update moves a collection to the front. */
export function getVisibleCollections(): CollectionView[] {
  return getLibrary()
    .collections.flatMap((collection) => viewOf(collection) ?? [])
    .sort((a, b) => b.collection.meta.updatedAt.localeCompare(a.collection.meta.updatedAt) || a.collection.meta.slug.localeCompare(b.collection.meta.slug));
}

export function findCollection(slug: string): CollectionView | undefined {
  return getVisibleCollections().find((view) => view.collection.meta.slug === slug);
}

export function findCollectionRedirect(slug: string): string | undefined {
  return getVisibleCollections().find((view) => view.collection.meta.redirectFrom?.includes(slug))?.collection.meta.slug;
}

export function collectionsInCategory(category?: string): CollectionView[] {
  return getVisibleCollections().filter((view) => !category || view.collection.meta.categories.includes(category));
}

/** Gallery cards: newest collection of each series only, so one subject never takes several slots. */
export function featuredCollections(category?: string): CollectionView[] {
  const seen = new Set<string>();
  return collectionsInCategory(category).filter((view) => !seen.has(view.collection.meta.series) && seen.add(view.collection.meta.series));
}

export function collectionsWithMember(slug: string): CollectionView[] {
  return getVisibleCollections().filter((view) => view.members.some((entry) => entry.meta.slug === slug));
}

export function collectionContentFor(collection: CollectionEntry, locale: Locale) {
  const content = collection.content[locale];
  if (!content) throw new Error(`collection ${collection.meta.slug} has no ${locale} content`);
  return content;
}
