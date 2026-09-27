/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/folk-doodle-flat-illustration
 * [OUTPUT]: 民间风涂鸦插画条目的专属测试：原文哈希一致、默认值逐字复现作者原文、扁平手作与童趣规则在所有组合中保留
 * [POS]: tests/unit/prompts/photo-art/redraw 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "folk-doodle-flat-illustration";
// SHA-256 of the prompt text as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "11d1a405c1a7d591ba3c9798734079df613ebb151b63998f04e773d5f8aafb4c";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and reproduces it with the defaults", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("keeps the flat handmade and whimsical rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      expect(compose(combo, "en")).toContain("Decorative Folk Flat Illustration with Doodle elements.");
      expect(compose(combo, "en")).toContain("cute, childlike, and whimsical");
      expect(compose(combo, "zh-CN")).toContain("装饰性民间风扁平插画");
    }
  });
});
