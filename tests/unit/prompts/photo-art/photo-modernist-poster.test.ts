/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/photo-modernist-poster
 * [OUTPUT]: 现代主义海报双拼条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、核心规则在所有组合中保留、文字选项不自相矛盾
 * [POS]: tests/unit/prompts/photo-art 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "photo-modernist-poster";
// SHA-256 of the prompt text as posted on X (captured 2026-09-23, post not edited), without the final newline.
const POSTED_SHA256 = "5b28e38ce3ac4689b491220ce3479668d04a4bb72eb361dcbc1d533c1a40b541";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["palette", "text"]);
    expect(combinations(entry.parameters)).toHaveLength(5 * 3);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original);
  });

  it("keeps the core rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("纵向画布上下分割为两个等高区域");
      expect(zh).toContain("有限而统一的色彩秩序");
      expect(zh).toContain("Logo、水印、边框、UI，不做多图拼接。");
      const en = compose(combo, "en");
      expect(en).toContain("two regions of equal height");
      expect(en).toContain("a limited, unified color order");
      expect(en).toContain("logos, watermarks, borders or UI, and do not make a multi-image collage.");
    }
  });

  it("a title option lifts only the no-text rule", () => {
    const base = defaultSelections(entry.parameters);
    for (const text of ["english-title", "chinese-title"]) {
      expect(compose({ ...base, text }, "zh-CN")).not.toContain("不生成文字");
      expect(compose({ ...base, text }, "en")).not.toContain("do not generate text");
    }
  });
});
