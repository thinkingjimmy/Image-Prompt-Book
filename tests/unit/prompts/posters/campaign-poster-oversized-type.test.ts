/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/campaign-poster-oversized-type
 * [OUTPUT]: 第四个条目的专属测试：原文与抓取时的哈希一致、默认值复现作者原文（仅规范 Markdown 符号）、核心规则在所有组合中保留、固定选项不与原文列表并存
 * [POS]: tests/unit/prompts/posters 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "campaign-poster-oversized-type";
// SHA-256 of the prompt code block as posted on X (captured 2026-09-23, post not edited), without its trailing space and our final newline.
const POSTED_SHA256 = "349629d4aeae917806cecfc61f0d2257902f8dbb924cbabbdc8f172e82b75b9f";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

/** The post's Markdown-style "* " lines mean "+" and "**" is bold; the templates spell them as plain text. */
const normalizeMarkdown = (text: string) => text.replaceAll("**", "").replaceAll("\n* ", "\n+ ").replace("一个核心主体\n\n+ 一个大胆", "一个核心主体\n+ 一个大胆");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its three options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["anomaly", "background", "material"]);
    expect(combinations(entry.parameters)).toHaveLength(5 * 6 * 6);
  });

  it("defaults reproduce the author's wording", () => {
    expect(compose(defaultSelections(entry.parameters), "zh-CN")).toBe(normalizeMarkdown(original));
  });

  it("keeps the core rules in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("但一张图只使用一个最强异常。");
      expect(zh).toContain("主体应该压在文字前面。");
      expect(zh).toContain("直接创作最终 9:16 竖版画面。\n");
      const en = compose(combo, "en");
      expect(en).toContain("But use only the single strongest anomaly in one image.");
      expect(en).toContain("The subject should sit in front of the text.");
      expect(en).toContain("Directly create the final 9:16 vertical image.\n");
    }
  });

  it("a fixed choice replaces the author's list instead of sitting beside it", () => {
    const base = defaultSelections(entry.parameters);
    const fixed = compose({ ...base, anomaly: "floating", background: "black", material: "chrome" }, "zh-CN");
    expect(fixed).not.toContain("透明化");
    expect(fixed).not.toContain("背景可以根据主题自动选择");
    expect(fixed).not.toContain("不要固定使用银色金属");
    expect(fixed).toContain("主体使用银色镀铬或液态金属材质");
  });
});
