/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/selective-color-sunglasses-portrait
 * [OUTPUT]: 黑白人像条目的专属测试：原文与抓取时的哈希一致、默认值只修正“长传”错别字、身份锁定与留色规则在所有组合中保留
 * [POS]: tests/unit/prompts/photo-art 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "selective-color-sunglasses-portrait";
// SHA-256 of the prompt text as posted on X (captured 2026-09-25, not edited), without the final newline.
const POSTED_SHA256 = "f1630e9c2cd86cab182a56761c92be1c2d4dba4d9c264c61e5f8470d8574e4bb";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its two options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["ratio", "lighting"]);
    expect(combinations(entry.parameters)).toHaveLength(4 * 3);
  });

  it("defaults reproduce the author's wording with only the typo fixed", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(original.replace("用户长传人物五官", "用户上传人物五官"));
  });

  it("keeps the identity lock and selective color in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("不换脸、不重塑");
      expect(zh).toContain("除墨镜外任何部位禁止出现彩色");
      const en = compose(combo, "en");
      expect(en).toContain("no face swap, no reshaping");
      expect(en).toContain("No color anywhere except the sunglasses");
    }
  });
});
