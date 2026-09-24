/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/giant-object-world
 * [OUTPUT]: 巨物世界条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、单色丝网版画与散落人物的规则在所有组合中保留
 * [POS]: tests/unit/prompts/posters 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "giant-object-world";
// SHA-256 of the post's second and third paragraphs as posted on X (captured 2026-09-24, not edited), without the final newline.
const POSTED_SHA256 = "353308175c4c6805f5d2e7706b98e66c7433e599c35eff2b378d5d9e62bcbaac";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["subject", "background"]);
    expect(combinations(entry.parameters)).toHaveLength(5 * 5);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original);
  });

  it("keeps the screen-print and scattered-figure rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("单色背景、丝网版画的质感和清楚的线条收住画面。");
      expect(zh).toContain("人物散着放，别排得太整齐");
      const en = compose(combo, "en");
      expect(en).toContain("background, a screen-print texture and clean, clear lines.");
      expect(en).toContain("Scatter the figures loosely");
    }
  });
});
