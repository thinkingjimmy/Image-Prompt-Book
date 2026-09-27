/**
 * [INPUT]: 依赖 ../../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/vintage-interior-illustration
 * [OUTPUT]: 复古室内插画条目的专属测试：原文哈希一致、默认值逐字复现作者原文、印刷质感与无照片写实规则在所有组合中保留
 * [POS]: tests/unit/prompts/posters/illustrated 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../../helpers";

const SLUG = "vintage-interior-illustration";
// SHA-256 of the prompt text as posted on X (captured 2026-09-27, not edited), without the final newline.
const POSTED_SHA256 = "0e718cc63adb50426406855e535fa9273488030c1e8e45dc4d0f8008653bc907";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["companion", "palette"]);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original);
  });

  it("keeps the print texture and hand-drawn rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      expect(en).toContain("screen-printed or risograph-printed");
      expect(en).toContain("No photorealism, no 3D rendering, no glossy surfaces.");
      expect(en).toContain("Keep the colors slightly faded and vintage");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("不要照片写实");
    }
  });
});
