/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/fuse-bead-editorial-poster
 * [OUTPUT]: 拼豆编辑海报条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、版式与避免清单在所有组合中保留
 * [POS]: tests/unit/prompts/photo-art 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "fuse-bead-editorial-poster";
// SHA-256 of the prompt text as posted on X (captured 2026-09-23, post not edited), without the final newline.
const POSTED_SHA256 = "e6b6df4dd43b08ac9a87cf0cc03871fee7401ecbe46b7ecd0cc5286b19cb4eec";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["outline", "light"]);
    expect(combinations(entry.parameters)).toHaveLength(3 * 3);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original);
  });

  it("keeps the layout and avoid list in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("中央圆孔、圆柱结构、规则网格、颗粒间的细微间隙。");
      expect(zh).toContain("最终画幅固定为 4:5 竖版。");
      expect(zh).toContain("复杂文字特效和过度3D。");
      const en = compose(combo, "en");
      expect(en).toContain("The final format is fixed at 4:5 vertical.");
      expect(en).toContain("complex text effects and excessive 3D.");
    }
  });

  it("the no-outline choice drops the outline ring in both languages", () => {
    const noOutline = { ...defaultSelections(entry.parameters), outline: "none" };
    expect(compose(noOutline, "zh-CN")).not.toContain("描边。");
    expect(compose(noOutline, "en")).not.toContain("to form a complete outline");
  });
});
