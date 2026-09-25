/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/photo-circle-logo-diptych
 * [OUTPUT]: 圆形 Logo 双拼条目的专属测试：原文与抓取时的哈希一致、默认值逐字复现作者原文、双拼与无文字规则在所有组合中保留
 * [POS]: tests/unit/prompts/photo-art 的条目套件；头像改编版见 avatars/circle-logo-avatar.test.ts
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "photo-circle-logo-diptych";
// SHA-256 of the author's reply as posted on X (captured 2026-09-25, not edited), without the final newline.
const POSTED_SHA256 = "ca27c27ab9193c0ffd5196993a6cce4f002be503860d35493820a666507ed430";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["ratio", "palette"]);
    expect(combinations(entry.parameters)).toHaveLength(3 * 3);
  });

  it("defaults reproduce the author's wording exactly", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original);
  });

  it("keeps the diptych and no-text rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("设计为上下双拼风格");
      expect(zh).toContain("不生成任何文字、标题、字母、标志、水印。");
      const en = compose(combo, "en");
      expect(en).toContain("top-and-bottom diptych");
      expect(en).toContain("Do not generate any text, titles, letters, logos or watermarks.");
    }
  });
});
