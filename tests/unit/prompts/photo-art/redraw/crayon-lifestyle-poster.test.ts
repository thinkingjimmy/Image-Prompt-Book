/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/crayon-lifestyle-poster
 * [OUTPUT]: 蜡笔生活海报条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、只出插画与文字占位规则在所有组合中保留
 * [POS]: tests/unit/prompts/photo-art/redraw 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "crayon-lifestyle-poster";
// SHA-256 of the author's reply as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "2636795ea5f4554dc6a4cbd5c4ecb02d434ad608d34c47d5565046f4eb35542f";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["accents", "decorations"]);
    expect(combinations(entry.parameters)).toHaveLength(3 * 2);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("keeps the illustration-only and lettering rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      expect(en).toContain("not a top-and-bottom comparison");
      expect(en).toContain("[MAIN HEADLINE]");
      expect(en).toContain("If no exact wording is supplied, omit all typography.");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("不要上下对比");
      expect(zh).toContain("[主标题]");
      expect(zh).toContain("如果没有提供确切的文字，就完全省略文字。");
    }
  });
});
