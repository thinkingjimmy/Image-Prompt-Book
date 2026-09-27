/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/papercut-layered-illustration
 * [OUTPUT]: 分层纸雕插画条目的专属测试：原文哈希一致、默认值逐字复现作者原文、纸层与哑光质感规则在所有组合中保留、不加描边时不残留白边描述
 * [POS]: tests/unit/prompts/photo-art/redraw 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "papercut-layered-illustration";
// SHA-256 of the prompt text as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "de20a784c8dba34e0e0ea30fb8bf35261ede759560fe59de189814122ed666d5";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["outline", "palette"]);
    expect(combinations(entry.parameters)).toHaveLength(2 * 3);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("keeps the paper-layer rules in every combination and drops the white layer without outlines", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      expect(en).toContain("clean cut edges that resemble laser-cut cardstock.");
      expect(en).toContain("Textures should appear matte and tactile");
      if (combo.outline === "none") expect(en).not.toContain("white outer outline");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("像激光切割的卡纸");
      if (combo.outline === "none") expect(zh).not.toContain("白色外轮廓");
    }
  });
});
