/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/circle-logo-avatar
 * [OUTPUT]: 圆形 Logo 头像改编版的专属测试：保留 DAAI 原文且哈希一致、模板只输出单个 1:1 圆形头像且不残留双拼措辞
 * [POS]: tests/unit/prompts/avatars 的条目套件；原版双拼见 photo-art/photo-circle-logo-diptych.test.ts
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "circle-logo-avatar";
// The adapted entry keeps DAAI's posted text as its original; same hash as photo-circle-logo-diptych.
const POSTED_SHA256 = "ca27c27ab9193c0ffd5196993a6cce4f002be503860d35493820a666507ed430";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the author's original and declares the palette option", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["palette"]);
  });

  it("outputs a single square avatar with no diptych left in any combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("设计为一张 1:1 正方形头像。");
      expect(zh).toContain("不做上下拼接，不展示原图。");
      expect(zh).not.toMatch(/上半部分|下半部分|双拼风格/);
      const en = compose(combo, "en");
      expect(en).toContain("Design a 1:1 square avatar.");
      expect(en).not.toMatch(/top half|bottom half|diptych in/);
    }
  });
});
