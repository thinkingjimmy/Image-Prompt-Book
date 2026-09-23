/**
 * [INPUT]: 依赖 @/lib/prompt/share 的 hash 编解码，依赖 @/lib/content/query 的列表规则
 * [OUTPUT]: 分享 hash（规范格式、版本/损坏/超长/未知键）与搜索筛选排序分页的单测（AC-02/AC-13/AC-21）
 * [POS]: tests/unit 的状态序列化测试
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadContentLibrary } from "@/lib/content/load";
import { isIndexableListQuery, listQueryToSearch, matchesQuery, normalizeSearchText, paginate, parseListQuery, sortItems } from "@/lib/content/query";
import { decodeShareHash, encodeShareHash } from "@/lib/prompt/share";

const entry = loadContentLibrary({ root: path.resolve("content"), mediaRoot: path.resolve("public"), allowFixtures: false }).entries[0]!;
const context = { templateVersion: entry.meta.templateVersion, parameters: entry.parameters, outputLocales: entry.meta.outputLocales };
const CANONICAL = "#v=1&template=2.0.0&output=en&p.faceColor=cream&p.blush=oval&p.background=charcoal&p.composition=lower-left&p.tilt=15&p.coloring=pastel&p.outline=none";

describe("share hash", () => {
  it("encodes the PRD canonical form", () => {
    const selections = { outline: "none", coloring: "pastel", tilt: "15", composition: "lower-left", background: "charcoal", blush: "oval", faceColor: "cream" };
    expect(encodeShareHash(context, { outputLocale: "en", selections })).toBe(CANONICAL);
  });

  it("round-trips", () => {
    const selections = { faceColor: "pale-peach", blush: "none", background: "deep-plum", composition: "centered", tilt: "20", coloring: "earthy", outline: "thin" };
    const hash = encodeShareHash(context, { outputLocale: "zh-CN", selections });
    expect(decodeShareHash(hash, context)).toEqual({ status: "ok", outputLocale: "zh-CN", selections, fallbacks: [] });
  });

  it("ignores unknown keys and falls back on invalid known values", () => {
    const result = decodeShareHash(`${CANONICAL.replace("p.blush=oval", "p.blush=%3Cscript%3E")}&evil=1&p.skin=blue`, context);
    expect(result).toMatchObject({ status: "ok", fallbacks: ["blush"] });
    if (result.status === "ok") expect(result.selections.blush).toBe("oval");
  });

  it("rejects old versions, malformed and oversized hashes", () => {
    expect(decodeShareHash(CANONICAL.replace("template=2.0.0", "template=1.0.0"), context)).toEqual({ status: "invalid", reason: "version" });
    expect(decodeShareHash("#v=2&template=2.0.0&output=en", context)).toEqual({ status: "invalid", reason: "malformed" });
    expect(decodeShareHash(`${CANONICAL}&x=${"a".repeat(2100)}`, context)).toEqual({ status: "invalid", reason: "too-long" });
  });

  it("treats unrelated anchors as no settings", () => {
    expect(decodeShareHash("#section-2", context)).toEqual({ status: "none" });
    expect(decodeShareHash("", context)).toEqual({ status: "none" });
  });

  it("reports an unsupported output locale", () => {
    const result = decodeShareHash(CANONICAL.replace("output=en", "output=ko"), context);
    expect(result).toMatchObject({ status: "ok", outputLocale: null, fallbacks: ["output"] });
  });
});

describe("list query", () => {
  const tags = ["minimal", "2d", "bot-icon", "image-to-image", "a", "b"];

  it("normalizes NFKC, case and whitespace", () => {
    expect(normalizeSearchText("  ＢＯＴ　Icon ")).toBe("bot icon");
  });

  it("parses, truncates and canonicalizes", () => {
    const query = parseListQuery({ q: "x".repeat(150), tags: "2d,unknown,MINIMAL,2d", sort: "weird", page: "0", extra: "1" }, tags);
    expect(query).toEqual({ q: "x".repeat(100), tags: ["minimal", "2d"], sort: "featured", page: 1 });
    expect(parseListQuery({ tags: "b,a,image-to-image,bot-icon,2d,minimal" }, tags).tags).toHaveLength(5);
    expect(listQueryToSearch({ q: "机器人", tags: ["minimal", "2d"], sort: "latest", page: 2 })).toBe("?q=%E6%9C%BA%E5%99%A8%E4%BA%BA&tags=minimal%2C2d&sort=latest&page=2");
    expect(listQueryToSearch({ q: "", tags: [], sort: "featured", page: 1 })).toBe("");
  });

  it("matches every term as a substring (AND), including Chinese", () => {
    expect(matchesQuery("Minimal Bot Icon 极简机器人头像", "bot 机器")).toBe(true);
    expect(matchesQuery("Minimal Bot Icon 极简机器人头像", "bot cat")).toBe(false);
  });

  it("is indexable only when unfiltered and default-sorted", () => {
    expect(isIndexableListQuery({ q: "", tags: [], sort: "featured", page: 3 })).toBe(true);
    expect(isIndexableListQuery({ q: "", tags: [], sort: "latest", page: 1 })).toBe(false);
  });

  it("sorts featured ranks first, then date desc, then slug", () => {
    const items = [
      { slug: "b", featuredRank: null, date: "2026-01-02" },
      { slug: "a", featuredRank: null, date: "2026-01-02" },
      { slug: "c", featuredRank: 1, date: "2025-01-01" },
      { slug: "d", featuredRank: null, date: "2026-02-01" },
    ];
    expect(sortItems(items, "featured").map((item) => item.slug)).toEqual(["c", "d", "a", "b"]);
    expect(sortItems(items, "latest").map((item) => item.slug)).toEqual(["d", "a", "b", "c"]);
  });

  it("paginates and flags out-of-range pages", () => {
    const list = Array.from({ length: 30 }, (_, index) => index);
    expect(paginate(list, 2)).toMatchObject({ items: list.slice(24), totalPages: 2, outOfRange: false });
    expect(paginate(list, 3).outOfRange).toBe(true);
    expect(paginate([], 1)).toMatchObject({ totalPages: 1, outOfRange: false });
  });
});
