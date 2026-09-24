/**
 * [INPUT]: 无框架依赖，纯函数
 * [OUTPUT]: 对外提供 PAGE_SIZE/MAX_QUERY_LENGTH/MAX_TAGS、normalizeSearchText()、normalizeQueryParam()、parseListQuery()、listQueryToSearch()、isIndexableListQuery()、matchesQuery()、sortItems()、paginate()、ListQuery/SortOrder 类型
 * [POS]: lib/content 的列表状态规则，服务端筛选/分页与客户端搜索框共用同一规范化逻辑，保证 URL 与结果一致
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
export const PAGE_SIZE = 24;
export const MAX_QUERY_LENGTH = 100;
export const MAX_TAGS = 5;
export const SORT_ORDERS = ["featured", "latest"] as const;
export type SortOrder = (typeof SORT_ORDERS)[number];

export type ListQuery = {
  q: string;
  tags: string[];
  sort: SortOrder;
  page: number;
};

export type RawSearchParams = Record<string, string | string[] | undefined>;

/** NFKC + lower-case folding; whitespace collapsed. Used for both haystacks and needles. */
export function normalizeSearchText(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();
}

/** URL form of the query: NFKC, collapsed whitespace, max 100 chars. Case is kept so the search box never rewrites what users typed. */
export function normalizeQueryParam(value: string): string {
  return value.normalize("NFKC").replace(/\s+/g, " ").trim().slice(0, MAX_QUERY_LENGTH).trim();
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** Parses whitelisted list params. Unknown tags, keys and invalid pages are dropped; callers redirect to the canonical form. */
export function parseListQuery(params: RawSearchParams, knownTags: readonly string[]): ListQuery {
  const q = normalizeQueryParam(first(params.q) ?? "");

  const requested = (first(params.tags) ?? "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
  // Canonical tag order follows the taxonomy so equivalent URLs collapse to one.
  const tags = knownTags.filter((tag) => requested.includes(tag)).slice(0, MAX_TAGS);

  const rawSort = first(params.sort);
  const sort: SortOrder = rawSort === "latest" ? "latest" : "featured";

  const rawPage = first(params.page);
  const page = rawPage && /^[1-9]\d{0,5}$/.test(rawPage) ? Number(rawPage) : 1;
  return { q, tags, sort, page };
}

export function listQueryToSearch(query: Partial<ListQuery>): string {
  const params = new URLSearchParams();
  if (query.q) params.set("q", query.q);
  if (query.tags?.length) params.set("tags", query.tags.join(","));
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.page && query.page > 1) params.set("page", String(query.page));
  const search = params.toString();
  return search ? `?${search}` : "";
}

/** Only the default-sorted, unfiltered listing (any page) is indexable. */
export function isIndexableListQuery(query: ListQuery): boolean {
  return !query.q && query.tags.length === 0 && query.sort === "featured";
}

/** Every whitespace-separated term must appear as a substring (AND). Chinese works as plain substrings. */
export function matchesQuery(haystack: string, q: string): boolean {
  const needle = normalizeSearchText(q);
  if (!needle) return true;
  const normalized = normalizeSearchText(haystack);
  return needle.split(" ").every((term) => normalized.includes(term));
}

export type SortableItem = {
  slug: string;
  featuredRank: number | null;
  /** publishedAt timestamp, or createdAt date for draft previews; compared as instants, not strings. */
  date: string;
};

export function sortItems<T extends SortableItem>(items: readonly T[], sort: SortOrder): T[] {
  const byDateThenSlug = (a: T, b: T) => Date.parse(b.date) - Date.parse(a.date) || a.slug.localeCompare(b.slug);
  return [...items].sort((a, b) => {
    if (sort === "featured") {
      const ra = a.featuredRank ?? Number.POSITIVE_INFINITY;
      const rb = b.featuredRank ?? Number.POSITIVE_INFINITY;
      if (ra !== rb) return ra - rb;
    }
    return byDateThenSlug(a, b);
  });
}

export function paginate<T>(items: readonly T[], page: number, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  return {
    items: items.slice((page - 1) * size, page * size),
    page,
    total: items.length,
    totalPages,
    outOfRange: items.length > 0 && page > totalPages,
  };
}
