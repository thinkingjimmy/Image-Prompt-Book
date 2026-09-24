/**
 * [INPUT]: 依赖 ../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/storybook-character-portrait
 * [OUTPUT]: 绘本角色肖像条目的专属测试：原文与抓取时的哈希一致、默认值仅把 Markdown 标题改写为 [小节]、身份保留规则在所有组合中保留
 * [POS]: tests/unit/prompts 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../helpers";

const SLUG = "storybook-character-portrait";
// SHA-256 of the prompt text as posted on X (captured 2026-09-24, post not edited), without the final newline.
const POSTED_SHA256 = "11949921e8436a8d16eb233c3221c483e07ef238c624ca49639c08c957f5d099";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.en.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its three options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["framing", "pose", "background"]);
    expect(combinations(entry.parameters)).toHaveLength(3 * 3 * 5);
  });

  it("defaults reproduce the author's wording, with headings as [Section] labels", () => {
    expect(compose(defaultSelections(entry.parameters), "en")).toBe(original.replace(/^### (.+)$/gm, "[$1]"));
  });

  it("keeps identity and style rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      expect(en).toContain("while keeping their identity immediately recognizable.");
      expect(en).toContain("Square 1:1 portrait, ");
      expect(en).toContain("No scenery, objects, text, borders, or distractions.");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("同时让人一眼就能认出是本人");
      expect(zh).toContain("正方形 1:1 肖像");
    }
  });
});
