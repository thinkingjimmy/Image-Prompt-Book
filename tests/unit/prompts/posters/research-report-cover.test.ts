/**
 * [INPUT]: 依赖 ../../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/research-report-cover
 * [OUTPUT]: 研究报告风封面条目的专属测试：原文与抓取时的哈希一致、输入位与色值的格式改写、配色方案与五套色值在所有组合中保留
 * [POS]: tests/unit/prompts/posters 的条目套件；通用的全组合渲染由 content.test.ts 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { defaultSelections } from "@/lib/prompt/template";
import { combinations, composer, promptEntry } from "../../helpers";

const SLUG = "research-report-cover";
// SHA-256 of the article's code block as posted on X (captured 2026-09-24, not edited), without the final newline.
const POSTED_SHA256 = "a217c7c8927308c1b6559d4a42ed595fdea82c8dfe1da4d602cce99d851690c3";

const entry = promptEntry(SLUG);
const compose = composer(entry);
const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");

describe(SLUG, () => {
  it("keeps the posted text unchanged and declares its three options", () => {
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(POSTED_SHA256);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["ratio", "usage", "scheme"]);
    expect(combinations(entry.parameters)).toHaveLength(5 * 4 * 6);
  });

  it("defaults differ from the author only in slot and hex-color formatting", () => {
    const zh = compose(defaultSelections(entry.parameters), "zh-CN");
    expect(zh).toContain("主题：\n[填写主题]");
    expect(zh).toContain("画幅比例：\n5:2");
    expect(zh).toContain("背景：#D97757");
    expect(zh).toContain("从以下辅助色选择：#EFEAE0、#CD6F47、#6B8A6F、#8FA9C7、#1A1A1A");
    const strip = (text: string) => text.replace(/\s+|\{\{[^}]*\}\}|\[[^\]]*\]|5:2|X封面|、/g, "");
    expect(strip(zh)).toBe(strip(original));
  });

  it("keeps every color scheme listed in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      for (const locale of ["en", "zh-CN"] as const) {
        const text = compose(combo, locale);
        for (const hex of ["#D97757", "#D8D5CF", "#B8C9B8", "#8FA9C7", "#EFEAE0"]) expect(text).toContain(hex);
      }
    }
  });
});
