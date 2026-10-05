/**
 * [INPUT]: 依赖 node:fs/path 读取 collections/，依赖 ./files 的读取器与 ./schema 的专题 schema，依赖 ./load 的 PromptEntry 类型
 * [OUTPUT]: 对外提供 loadCollections()、collectionBlockers()、MIN_COLLECTION_MEMBERS、CollectionEntry 类型
 * [POS]: lib/content 的专题加载与跨文件校验，由 load.ts 在条目之后调用：成员必须是已存在的条目，分组与双语点评一一对应，同系列专题不能大面积重复
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import { LOCALES, type Locale } from "@/i18n/config";
import { readJson } from "./files";
import type { PromptEntry } from "./load";
import { collectionContentSchema, collectionMetaSchema, type CollectionContent, type CollectionMeta, type Taxonomy } from "./schema";

/** Fewer members than this is a card list, not a guide; such collections cannot be published. */
export const MIN_COLLECTION_MEMBERS = 3;

export type CollectionEntry = {
  meta: CollectionMeta;
  content: Partial<Record<Locale, CollectionContent>>;
  /** Every member slug in reading order, across groups. */
  members: string[];
  repoPath: string;
};

type CollectionContext = {
  root: string;
  allowFixtures: boolean;
  taxonomy: Taxonomy;
  entries: PromptEntry[];
  /** Slugs that pass the prompt publication predicate. */
  publicSlugs: ReadonlySet<string>;
};

/** Every reason a collection may not be public. Empty means it can be published. */
export function collectionBlockers(collection: CollectionEntry, publicSlugs: ReadonlySet<string>): string[] {
  const blockers: string[] = [];
  if (collection.meta.status !== "published") blockers.push(`status is ${collection.meta.status}`);
  if (!collection.meta.publishedAt) blockers.push("publishedAt is missing");
  for (const locale of LOCALES) if (!collection.content[locale]) blockers.push(`missing ${locale} page content`);
  const published = collection.members.filter((slug) => publicSlugs.has(slug)).length;
  if (published < MIN_COLLECTION_MEMBERS) blockers.push(`needs at least ${MIN_COLLECTION_MEMBERS} published members (has ${published})`);
  return blockers;
}

function sameKeys(actual: string[], expected: string[]): { missing: string[]; extra: string[] } {
  return { missing: expected.filter((key) => !actual.includes(key)), extra: actual.filter((key) => !expected.includes(key)) };
}

function loadCollection(dir: string, context: CollectionContext, issues: string[]): CollectionEntry | null {
  const name = path.basename(dir);
  const label = `collections/${name}`;
  const before = issues.length;
  const meta = readJson(path.join(dir, "meta.json"), collectionMetaSchema, issues, `${label}/meta.json`);
  if (!meta) return null;

  if (meta.id !== name || meta.slug !== name) issues.push(`${label}: id and slug must equal the directory name`);
  if (meta.fixture && !context.allowFixtures) issues.push(`${label}: fixture records are not allowed in this content root`);
  if (meta.status === "published" && !meta.publishedAt) issues.push(`${label}: published collections need publishedAt`);
  if (meta.status !== "published" && meta.status !== "archived" && meta.publishedAt) issues.push(`${label}: drafts must not have publishedAt`);
  if (meta.updatedAt < meta.createdAt) issues.push(`${label}: updatedAt precedes createdAt`);
  for (const category of meta.categories) {
    if (!context.taxonomy.categories.some((item) => item.id === category)) issues.push(`${label}: unknown category ${category}`);
  }
  if (new Set(meta.categories).size !== meta.categories.length) issues.push(`${label}: duplicate categories`);

  const groupIds = meta.groups.map((group) => group.id);
  if (new Set(groupIds).size !== groupIds.length) issues.push(`${label}: duplicate group ids`);
  const members = meta.groups.flatMap((group) => group.members);
  if (new Set(members).size !== members.length) issues.push(`${label}: a prompt appears in more than one place`);
  for (const slug of members) {
    if (!context.entries.some((entry) => entry.meta.slug === slug)) issues.push(`${label}: unknown member prompt ${slug}`);
  }
  if (!members.includes(meta.cover)) issues.push(`${label}: cover ${meta.cover} is not a member`);

  const content: CollectionEntry["content"] = {};
  for (const locale of LOCALES) {
    const data = readJson(path.join(dir, `${locale}.json`), collectionContentSchema, issues, `${label}/${locale}.json`);
    if (!data) continue;
    content[locale] = data;
    const groups = sameKeys(Object.keys(data.groups), groupIds);
    const copy = sameKeys(Object.keys(data.members), members);
    for (const id of groups.missing) issues.push(`${label}: ${locale}.json lacks groups.${id}`);
    for (const id of groups.extra) issues.push(`${label}: ${locale}.json describes unknown group ${id}`);
    for (const slug of copy.missing) issues.push(`${label}: ${locale}.json lacks members.${slug}`);
    for (const slug of copy.extra) issues.push(`${label}: ${locale}.json describes non-member ${slug}`);
  }

  const collection: CollectionEntry = { meta, content, members, repoPath: path.relative(process.cwd(), dir).split(path.sep).join("/") };
  if (meta.status === "published") {
    for (const blocker of collectionBlockers(collection, context.publicSlugs)) issues.push(`${label}: cannot be published — ${blocker}`);
  }
  return issues.length === before ? collection : null;
}

/** Same-series collections must answer different tasks, so at most half of the smaller one may overlap. */
function checkSeriesOverlap(collections: CollectionEntry[], issues: string[]) {
  for (const [index, a] of collections.entries()) {
    for (const b of collections.slice(index + 1)) {
      if (a.meta.series !== b.meta.series) continue;
      const shared = a.members.filter((slug) => b.members.includes(slug)).length;
      if (shared * 2 > Math.min(a.members.length, b.members.length)) {
        issues.push(`collections/${b.meta.slug}: shares ${shared} members with ${a.meta.slug} in series ${a.meta.series}; merge them or give each a distinct task`);
      }
    }
  }
}

export function loadCollections(context: CollectionContext, issues: string[]): CollectionEntry[] {
  const collectionsDir = path.join(context.root, "collections");
  if (!existsSync(collectionsDir)) return [];
  const dirs = readdirSync(collectionsDir, { withFileTypes: true })
    .filter((item) => item.isDirectory())
    .map((item) => path.join(collectionsDir, item.name))
    .sort();
  const collections = dirs.map((dir) => loadCollection(dir, context, issues)).filter((item): item is CollectionEntry => item !== null);

  checkSeriesOverlap(collections, issues);
  const claimed = new Set(collections.map((collection) => collection.meta.slug));
  for (const collection of collections) {
    for (const old of collection.meta.redirectFrom ?? []) {
      if (claimed.has(old)) issues.push(`collections/${collection.meta.slug}: redirectFrom "${old}" collides with another collection`);
      claimed.add(old);
    }
  }
  return collections;
}
