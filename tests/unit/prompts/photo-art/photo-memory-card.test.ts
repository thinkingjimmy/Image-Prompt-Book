/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/photo-memory-card
 * [OUTPUT]: 第三个条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、核心规则在所有组合中保留、整句选项语法正确
 * [POS]: tests/unit/prompts/photo-art 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "photo-memory-card";
// SHA-256 of the prompt text as posted on X (captured 2026-09-23, post not edited), without the final newline.
const POSTED_SHA256 = "68fb3195079836bfb754e870a8ccd667f32ebcab177b877adac22991716150f6";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its five options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["paper", "colorPatch", "sketchMedium", "phrase", "mood"]);
    expect(combinations(entry.parameters)).toHaveLength(4 * 3 * 4 * 3 * 3);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("keeps the core rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      expect(en).toContain("with a strict 50/50 split.");
      expect(en).toContain("Keep the original photo unchanged in the top half.");
      expect(en).toContain("with loose, imperfect lines and minimal details.");
      expect(en).toContain("Do not add extra elements or copy the reference composition exactly.");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("严格上下 50/50 分割");
      expect(zh).toContain("上半部分保持原照片不变。");
    }
  });

  it("whole-sentence options read naturally", () => {
    const base = defaultSelections(entry.parameters);
    const noText = compose({ ...base, phrase: "none" }, "en");
    expect(noText).toContain("minimal details. Add subtle Risograph grain, but no text.");
    expect(noText).not.toMatch(/handwritten|\band and\b/);
    expect(compose({ ...base, colorPatch: "none" }, "en")).toContain("use textured off-white handmade paper and keep the paper plain without a color patch.");
    expect(compose({ ...base, phrase: "chinese" }, "zh-CN")).toContain("加入一句简短的手写中文短语，并加入细微的 Risograph 印刷颗粒。");
  });
});
