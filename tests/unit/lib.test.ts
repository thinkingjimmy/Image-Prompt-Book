/**
 * [INPUT]: 依赖 @/lib/prompt/template 的解析与编排、@/lib/prompt/share 的 hash 编解码、@/lib/content/query 的列表规则，依赖 ./helpers 的 promptEntry
 * [OUTPUT]: 纯逻辑单测：模板引擎（白名单 token、恶意/畸形输入、段落切分、选择回退）、分享 hash（规范格式、版本/损坏/超长/未知键）、搜索筛选排序分页（AC-02/AC-13/AC-21）
 * [POS]: tests/unit 的引擎级套件；只用合成数据与首个条目的参数表，不断言具体 Prompt 文案
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { describe, expect, it } from "vitest";
import type { Parameter } from "@/lib/content/schema";
import { isIndexableListQuery, listQueryToSearch, matchesQuery, normalizeSearchText, paginate, parseListQuery, sortItems } from "@/lib/content/query";
import { decodeShareHash, encodeShareHash } from "@/lib/prompt/share";
import { composePrompt, parseTemplate, sanitizeSelections, TemplateError, toParagraphs } from "@/lib/prompt/template";
import { promptEntry } from "./helpers";

const color: Parameter = {
  id: "color",
  type: "select",
  renderAs: "inline",
  default: "red",
  options: [
    { id: "red", labels: { en: "Red", "zh-CN": "红" }, replacements: { en: "red", "zh-CN": "红色" } },
    { id: "blue", labels: { en: "Blue", "zh-CN": "蓝" }, replacements: { en: "<b>blue</b> {not a token}", "zh-CN": "蓝色" } },
  ],
};
const record = { parameters: [color], templates: { en: "A {{color}} cat and a {{color}} dog.\n", "zh-CN": "一只{{color}}的猫。\n" } };

describe("parseTemplate", () => {
  it("splits text and tokens", () => {
    expect(parseTemplate("a {{x}} b")).toEqual([
      { type: "text", value: "a " },
      { type: "token", id: "x" },
      { type: "text", value: " b" },
    ]);
  });

  it.each(["{{ x }}", "{{x", "x}}", "{{x.y}}", "{{constructor()}}", "{{{x}}}", "{{1x}}"])("rejects malformed token %s", (source) => {
    expect(() => parseTemplate(source)).toThrow(TemplateError);
  });
});

describe("composePrompt", () => {
  it("replaces every occurrence and treats replacements as plain leaf strings", () => {
    expect(composePrompt({ record, selections: { color: "blue" }, outputLocale: "en" })).toBe("A <b>blue</b> {not a token} cat and a <b>blue</b> {not a token} dog.\n");
  });

  it("falls back to defaults for unknown or hostile selections", () => {
    const out = composePrompt({ record, selections: { color: "__proto__", other: "x" }, outputLocale: "zh-CN" });
    expect(out).toBe("一只红色的猫。\n");
  });

  it("normalizes CRLF and trailing newlines", () => {
    const crlf = { parameters: [color], templates: { en: "x {{color}}\r\n\r\n\r\n" } };
    expect(composePrompt({ record: crlf, selections: {}, outputLocale: "en" })).toBe("x red\n");
  });

  it("throws for an undeclared token", () => {
    expect(() => composePrompt({ record: { parameters: [], templates: { en: "{{x}}" } }, selections: {}, outputLocale: "en" })).toThrow(TemplateError);
  });
});

describe("sanitizeSelections", () => {
  it("reports invalid known keys only", () => {
    expect(sanitizeSelections([color], { color: "green", junk: "1" })).toEqual({ selections: { color: "red" }, invalid: ["color"] });
  });
});

describe("toParagraphs", () => {
  it("detects headings and isolates block tokens", () => {
    const paragraphs = toParagraphs(parseTemplate("[Face]\n\nLine one\nline two {{a}}.\n\n{{b}}\n\nEnd\n"));
    expect(paragraphs).toEqual([
      { kind: "heading", text: "Face" },
      { kind: "body", nodes: [{ type: "text", value: "Line one\nline two " }, { type: "token", id: "a" }, { type: "text", value: "." }] },
      { kind: "body", nodes: [{ type: "token", id: "b" }] },
      { kind: "body", nodes: [{ type: "text", value: "End" }] },
    ]);
  });
});

const entry = promptEntry("grokbot-capsule-icon");
const context = { variants: entry.variants, outputLocales: entry.meta.outputLocales };
const CANONICAL = "#v=1&template=2.0.0&output=en&p.faceColor=cream&p.blush=oval&p.background=charcoal&p.composition=lower-left&p.tilt=15&p.coloring=pastel&p.outline=none";

describe("share hash", () => {
  it("encodes the PRD canonical form", () => {
    const selections = { outline: "none", coloring: "pastel", tilt: "15", composition: "lower-left", background: "charcoal", blush: "oval", faceColor: "cream" };
    expect(encodeShareHash(context, { variantId: "short", outputLocale: "en", selections })).toBe(CANONICAL);
  });

  it("round-trips", () => {
    const selections = { faceColor: "pale-peach", blush: "none", background: "deep-plum", composition: "centered", tilt: "20", coloring: "earthy", outline: "thin" };
    const hash = encodeShareHash(context, { variantId: "short", outputLocale: "zh-CN", selections });
    expect(decodeShareHash(hash, context)).toEqual({ status: "ok", variantId: "short", outputLocale: "zh-CN", selections, fallbacks: [] });
  });

  it("records a non-default variant with its own template version", () => {
    const selections = { composition: "right-gentle", background: "deep-plum", faceColor: "cream", blush: "none", shading: "flat", outline: "thin", featureBudget: "two" };
    const hash = encodeShareHash(context, { variantId: "full", outputLocale: "en", selections });
    expect(hash).toBe(
      "#v=1&variant=full&template=1.1.0&output=en&p.composition=right-gentle&p.background=deep-plum&p.faceColor=cream&p.blush=none&p.shading=flat&p.outline=thin&p.featureBudget=two",
    );
    expect(decodeShareHash(hash, context)).toEqual({ status: "ok", variantId: "full", outputLocale: "en", selections, fallbacks: [] });
    expect(decodeShareHash(hash.replace("variant=full", "variant=nope"), context)).toEqual({ status: "invalid", reason: "malformed" });
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
