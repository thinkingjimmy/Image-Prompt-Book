/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/mid-century-modern-cover
 * [OUTPUT]: 中世纪现代主义封面条目的专属测试：原文与抓取时的哈希一致、默认值与原文只差输入位改写、三色与满版出血规则在所有组合中保留
 * [POS]: tests/unit/prompts/posters/type-led 的条目套件；输入位改写方式同 research-report-cover.test.ts
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "mid-century-modern-cover";
// SHA-256 of the article's code block as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "a1aed758e5224f3af80009df835df046358d4bd7900c0d645c133d376ad848d9";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its three options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["subject", "ratio", "accent"]);
    expect(combinations(entry.parameters)).toHaveLength(6 * 6 * 6);
  });

  it("defaults differ from the author only in the input slots", () => {
    const zh = compose(defaultSelections(entry.parameters), "zh-CN");
    expect(zh).toContain("主题：[填写主题]");
    expect(zh).toContain("核心主体：自动判断");
    expect(zh).toContain("画幅比例：5:2");
    expect(zh).toContain("点缀色：自动判断");
    const strip = (text: string) => text.replace(/[{[][^}\]\n]*[}\]]+/g, "").replace(/(核心主体|画幅比例|点缀色)：[^\n]*/g, "$1：");
    expect(strip(zh)).toBe(strip(original));
  });

  it("keeps the three-color and full-bleed rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("整张图严格控制在 3 种颜色以内");
      expect(zh).toContain("画面必须满版出血。");
      const en = compose(combo, "en");
      expect(en).toContain("Keep the whole image strictly within 3 colors");
      expect(en).toContain("The image must be full bleed.");
    }
  });
});
