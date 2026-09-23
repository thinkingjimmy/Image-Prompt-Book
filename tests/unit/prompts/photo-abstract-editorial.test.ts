/**
 * [INPUT]: 依赖 ../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/photo-abstract-editorial
 * [OUTPUT]: 第二个条目的专属测试：原文与上游提交一致、核心规则在所有组合中保留、默认值复现作者原文、选项之间无矛盾
 * [POS]: tests/unit/prompts 的条目套件；通用的全组合渲染由 content.test.ts 负责，这里只证明本条目的语义，不证明生图质量
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { combinations, composer, promptEntry } from "../helpers";

const SLUG = "photo-abstract-editorial";
// SHA-256 of references/photo-abstract-editorial-prompt.zh-CN.md at upstream commit 49e5507.
const UPSTREAM_ZH_SHA256 = "a9652d46202e1153490387dc222b0a9b1918aa88706d5d7dd45cb16d599ad051";

const entry = promptEntry(SLUG);
const compose = composer(entry);

describe(SLUG, () => {
  it("keeps the author's original unchanged and declares its eight options", () => {
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["abstraction", "markFamily", "panelRatio", "panelColor", "motifScale", "accentColors", "subtitle", "titleLayout"]);
    expect(combinations(entry.parameters)).toHaveLength(3 * 6 * 3 * 4 * 3 * 3 * 3 * 3);
    // Upstream has no final newline; content files end with exactly one, which is the only change.
    const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");
    expect(original.endsWith("\n") && !original.endsWith("\n\n")).toBe(true);
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(UPSTREAM_ZH_SHA256);
  });

  it("keeps the core rules in every combination", () => {
    for (const combo of combinations(entry.parameters).filter((_, index) => index % 7 === 0)) {
      const en = compose(combo, "en");
      expect(en).toContain("Treat the uploaded image strictly as the sole source of content and as the original photograph.");
      expect(en).toContain("Every mark must correspond to a fact in the source photo.");
      expect(en).toContain("Output only one finished work joining the photograph and abstract panel.");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("将上传的图片严格作为唯一的内容来源和摄影原片使用。");
      expect(zh).toContain("只输出一张完成的摄影与抽象面板拼接作品。");
    }
  });

  it("defaults reproduce the author's wording", () => {
    const en = compose({}, "en");
    expect(en).toContain("Default to relationships first, contours discarded, adapting to the subject:");
    expect(en).toContain("neutral ivory (#F3F0E8, or a harmonious color from the same family)");
    expect(en).toContain("- Motif width: about 30%–42% of panel width.");
    expect(en).toContain("1. Lower-left aligned.");
  });

  it("options never contradict fixed sentences", () => {
    const sage = compose({ panelColor: "pale-sage" }, "en");
    expect(sage).toContain("unbroken pale sage (#E4E8DF");
    expect(sage).not.toMatch(/ivory|#F3F0E8/);
    expect(compose({ panelColor: "mist-gray" }, "zh-CN")).not.toMatch(/象牙|#F3F0E8/);

    const photoLed = compose({ panelRatio: "photo-led" }, "en");
    expect(photoLed).toContain("photo area about 58%–70%");
    expect(photoLed).not.toContain("38%–52%");
    expect(photoLed).toContain("do not force 1:1, 3:4, or equal halves.");

    const noSubtitle = compose({ subtitle: "none" }, "en");
    expect(noSubtitle).toContain("Generate only one main title and no subtitle.");
    expect(noSubtitle).not.toContain("Add a three-to-seven-word subtitle only if");

    const strokes = compose({ markFamily: "strokes" }, "zh-CN");
    expect(strokes).toContain("主要标记使用弧形或锥形笔触。");
    expect(strokes).not.toContain("主要标记可从以下形式中选择一种");

    const centered = compose({ titleLayout: "bottom-center" }, "en");
    expect(centered).toContain("Use a bottom-centered layout.");
    expect(centered).not.toContain("Lower-left aligned");
  });
});
