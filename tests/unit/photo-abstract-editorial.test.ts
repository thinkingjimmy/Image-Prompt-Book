/**
 * [INPUT]: 依赖 content/ 的 photo-abstract-editorial 条目（经 loadContentLibrary），依赖 @/lib/prompt/template 的 composePrompt
 * [OUTPUT]: 第二个条目的确定性测试：全部组合 × 2 语言完整无残留、核心规则保留、选项之间无矛盾、原文与上游提交一致
 * [POS]: tests/unit 的内容级回归套件；只证明模板编排，不证明生图质量
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/i18n/config";
import { loadContentLibrary, type PromptEntry } from "@/lib/content/load";
import { composePrompt, defaultSelections, type Selections } from "@/lib/prompt/template";

const SLUG = "photo-abstract-editorial";
// SHA-256 of references/photo-abstract-editorial-prompt.zh-CN.md at upstream commit 49e5507.
const UPSTREAM_ZH_SHA256 = "a9652d46202e1153490387dc222b0a9b1918aa88706d5d7dd45cb16d599ad051";

const library = loadContentLibrary({ root: path.resolve("content"), mediaRoot: path.resolve("public"), allowFixtures: false });
const entry = library.entries.find((item) => item.meta.slug === SLUG) as PromptEntry;
const compose = (selections: Selections, locale: Locale) => composePrompt({ record: entry, selections, outputLocale: locale });
const defaults = () => defaultSelections(entry.parameters);
const combos = entry.parameters.reduce<Selections[]>((all, parameter) => all.flatMap((combo) => parameter.options.map((option) => ({ ...combo, [parameter.id]: option.id }))), [{}]);

describe(SLUG, () => {
  it("loads without issues and keeps the author's original unchanged", () => {
    expect(library.issues).toEqual([]);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["abstraction", "markFamily", "panelRatio", "panelColor", "motifScale", "accentColors", "subtitle", "titleLayout"]);
    // Upstream has no final newline; content files end with exactly one, which is the only change.
    const original = readFileSync(path.join("content", "prompts", SLUG, "original.zh-CN.txt"), "utf8");
    expect(original.endsWith("\n") && !original.endsWith("\n\n")).toBe(true);
    expect(createHash("sha256").update(original.slice(0, -1)).digest("hex")).toBe(UPSTREAM_ZH_SHA256);
  });

  it("renders every combination in both languages completely", () => {
    expect(combos).toHaveLength(3 * 6 * 3 * 4 * 3 * 3 * 3 * 3);
    for (const combo of combos) {
      for (const locale of LOCALES) {
        const text = compose(combo, locale);
        expect(text).not.toMatch(/\{\{|\}\}|undefined|\*\*|^#/m);
        expect(text.endsWith("\n") && !text.endsWith("\n\n")).toBe(true);
      }
    }
  });

  it("keeps the core rules in every combination", () => {
    for (const combo of combos.filter((_, index) => index % 7 === 0)) {
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
    const en = compose(defaults(), "en");
    expect(en).toContain("Default to relationships first, contours discarded, adapting to the subject:");
    expect(en).toContain("neutral ivory (#F3F0E8, or a harmonious color from the same family)");
    expect(en).toContain("- Motif width: about 30%–42% of panel width.");
    expect(en).toContain("1. Lower-left aligned.");
  });

  it("options never contradict fixed sentences", () => {
    const sage = compose({ ...defaults(), panelColor: "pale-sage" }, "en");
    expect(sage).toContain("unbroken pale sage (#E4E8DF");
    expect(sage).not.toMatch(/ivory|#F3F0E8/);
    expect(compose({ ...defaults(), panelColor: "mist-gray" }, "zh-CN")).not.toMatch(/象牙|#F3F0E8/);

    const photoLed = compose({ ...defaults(), panelRatio: "photo-led" }, "en");
    expect(photoLed).toContain("photo area about 58%–70%");
    expect(photoLed).not.toContain("38%–52%");
    expect(photoLed).toContain("do not force 1:1, 3:4, or equal halves.");

    const noSubtitle = compose({ ...defaults(), subtitle: "none" }, "en");
    expect(noSubtitle).toContain("Generate only one main title and no subtitle.");
    expect(noSubtitle).not.toContain("Add a three-to-seven-word subtitle only if");

    const strokes = compose({ ...defaults(), markFamily: "strokes" }, "zh-CN");
    expect(strokes).toContain("主要标记使用弧形或锥形笔触。");
    expect(strokes).not.toContain("主要标记可从以下形式中选择一种");

    const centered = compose({ ...defaults(), titleLayout: "bottom-center" }, "en");
    expect(centered).toContain("Use a bottom-centered layout.");
    expect(centered).not.toContain("Lower-left aligned");
  });
});
