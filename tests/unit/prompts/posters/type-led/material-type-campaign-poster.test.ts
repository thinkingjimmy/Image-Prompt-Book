/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/material-type-campaign-poster
 * [OUTPUT]: 材质巨字海报条目的专属测试：原文哈希一致、默认值逐字复现作者原文（含五个待填写字段）、四个预设填满全部字段且不残留方括号
 * [POS]: tests/unit/prompts/posters/type-led 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "material-type-campaign-poster";
// SHA-256 of the author's reply as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "d502d3bf6bce83d40ccdcd45c6e7b2e9882063ac11567a7f79e1ae52c6af7d62";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and defaults to the author's fill-in fields", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("every preset fills all five fields and keeps the interlacing rule", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      for (const field of ["Headline:", "Subject:", "Camera:", "Palette:", "Type Interaction:"]) expect(en).toContain(field);
      expect(en).toContain("The subject and type interlace in depth");
      if (combo.brief !== "custom") {
        expect(en).not.toMatch(/\[[A-Z_ +]+\]/);
        expect(compose(combo, "zh-CN")).not.toMatch(/\[[^\]]+\]/);
      }
    }
  });
});
