/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/storybook-photo-illustration
 * [OUTPUT]: 照片转绘本插画条目的专属测试：原文哈希一致、原版默认值逐字复现作者原文、通用版不残留秋千/母子专属描述
 * [POS]: tests/unit/prompts/photo-art/redraw 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { composePrompt, defaultSelections } from "@/lib/prompt/template";
import { combinations, promptEntry } from "../../../helpers";

const SLUG = "storybook-photo-illustration";
// SHA-256 of the prompt text as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "bf138588d4588d7bd7ee2cf65d86a57fd28c7d55b8ab0b1c97a2823a5e279825";

const entry = promptEntry(SLUG);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");
const variant = (id: string) => entry.variants.find((item) => item.id === id)!;

describe(SLUG, () => {
  it("keeps the posted text unchanged and offers the original and an any-photo version", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.variants.map((item) => item.id)).toEqual(["swing", "any"]);
  });

  it("the original version's defaults reproduce the author's wording exactly", () => {
    const swing = variant("swing");
    expect(composePrompt({ record: swing, selections: defaultSelections(swing.parameters), outputLocale: "en" })).toBe(original);
  });

  it("the any-photo version drops every swing-specific detail", () => {
    const any = variant("any");
    for (const selections of combinations(any.parameters)) {
      expect(composePrompt({ record: any, selections, outputLocale: "en" })).not.toMatch(/\bswing\b|\bmother\b|\bchild\b|garden path|garden adventure/i);
      expect(composePrompt({ record: any, selections, outputLocale: "zh-CN" })).not.toMatch(/秋千|母亲|孩子|花园小路|花园冒险/);
    }
  });
});
