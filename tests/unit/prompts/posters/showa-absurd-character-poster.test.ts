/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/showa-absurd-character-poster
 * [OUTPUT]: 昭和荒诞角色海报条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、风格公式在所有组合中保留、不加签名时不残留签名
 * [POS]: tests/unit/prompts/posters 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "showa-absurd-character-poster";
// SHA-256 of the author's reply as posted on X (captured 2026-09-25, not edited), without the final newline.
const POSTED_SHA256 = "4451adbf8af11b7228e1ccecc9205aed02f817792fe99695cdf47934933ca186";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["character", "signature"]);
    expect(combinations(entry.parameters)).toHaveLength(4 * 2);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original);
  });

  it("keeps the style formula in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      for (const locale of ["en", "zh-CN"] as const) {
        expect(compose(combo, locale)).toContain("Mid-century Biomorphic Abstraction × Japanese Modernist Poster × Showa Tokusatsu Poster × Reaction Meme × Early Low-poly 3D");
      }
    }
  });

  it("the no-signature choice leaves no signature behind", () => {
    const unsigned = { ...defaultSelections(entry.parameters), signature: "none" };
    expect(compose(unsigned, "zh-CN")).not.toContain("voxCAT");
    expect(compose(unsigned, "en")).not.toContain("voxCAT");
  });
});
