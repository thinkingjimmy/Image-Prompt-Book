/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/cmyk-halftone-blur-type-poster
 * [OUTPUT]: CMYK 网点虚焦字海报条目的专属测试：原文哈希一致、默认值逐字复现作者原文（含五个待填写字段）、四个预设填满全部字段且不残留方括号
 * [POS]: tests/unit/prompts/posters/type-led 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "cmyk-halftone-blur-type-poster";
// SHA-256 of the author's reply as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "ea8416966570b37ead986d87e6e6c54e9a469230f3472e04702015e0b378f9ca";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and defaults to the author's fill-in fields", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("every preset fills all five fields and keeps the halftone rule", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      for (const field of ["Title:", "Supporting copy:", "Metadata:", "Subject:", "Layout:"]) expect(en).toContain(field);
      expect(en).toContain("Ordered print screening, not random grain.");
      if (combo.brief !== "custom") {
        expect(en).not.toMatch(/\[[A-Z_ +]+\]/);
        expect(compose(combo, "zh-CN")).not.toMatch(/\[[^\]]+\]/);
      }
    }
  });
});
