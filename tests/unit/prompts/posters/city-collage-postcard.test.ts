/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/city-collage-postcard
 * [OUTPUT]: 城市拼贴明信片条目的专属测试：原文哈希一致、默认值（成都）逐字复现作者原文、3:4 与单一语言规则在所有城市中保留
 * [POS]: tests/unit/prompts/posters 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "city-collage-postcard";
// SHA-256 of the article's code block as posted on X (captured 2026-09-27 from the page text, not edited), without the final newline.
const POSTED_SHA256 = "cc18681aedf1306725f939ca232e987a3ef353c8e8e8ff76355dce9a8d2463a2";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares the city option", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["city"]);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original);
  });

  it("keeps the 3:4 format and the single-language rule for every city", () => {
    for (const combo of combinations(entry.parameters)) {
      expect(compose(combo, "zh-CN")).toContain("宽高比 3:4");
      expect(compose(combo, "zh-CN")).toContain("不允许语言混杂");
      expect(compose(combo, "en")).toContain("aspect ratio 3:4");
    }
  });
});
