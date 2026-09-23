/**
 * [INPUT]: 依赖 content/ 真实首个案例（经 loadContentLibrary）、@/lib/prompt/template 的 composePrompt、tests/unit/golden 基线
 * [OUTPUT]: 首个案例的确定性测试：精简版 1728 组合 × 2 语言与完整版 96 组合 × 2 语言、golden snapshot、构图/腮红/上色/描边语义回归（AC-06–AC-10）
 * [POS]: tests/unit 的内容级回归套件；只证明模板编排，不证明生图质量
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/i18n/config";
import { loadContentLibrary, type PromptEntry } from "@/lib/content/load";
import { composePrompt, defaultSelections, parseTemplate, templateTokenIds, type Selections } from "@/lib/prompt/template";

const library = loadContentLibrary({ root: path.resolve("content"), mediaRoot: path.resolve("public"), allowFixtures: false });
const entry = library.entries.find((item) => item.meta.slug === "grokbot-capsule-icon") as PromptEntry;
const compose = (selections: Selections, outputLocale: Locale) => composePrompt({ record: entry, selections, outputLocale });
const defaults = () => defaultSelections(entry.parameters);
const PARAMETERS = ["faceColor", "blush", "background", "composition", "tilt", "coloring", "outline"];

function allCombinations(): Selections[] {
  return entry.parameters.reduce<Selections[]>((combos, parameter) => combos.flatMap((combo) => parameter.options.map((option) => ({ ...combo, [parameter.id]: option.id }))), [{}]);
}

describe("grokbot-capsule-icon content", () => {
  it("loads without validation issues", () => {
    expect(library.issues).toEqual([]);
    expect(entry.meta.templateVersion).toBe("2.0.0");
  });

  it("declares the seven open parameters, each used once per template", () => {
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(PARAMETERS);
    for (const locale of LOCALES) {
      const nodes = parseTemplate(entry.templates[locale]!);
      expect(templateTokenIds(nodes).sort()).toEqual([...PARAMETERS].sort());
      expect(nodes.filter((node) => node.type === "token")).toHaveLength(PARAMETERS.length);
    }
  });
});

describe("composePrompt — every combination × 2 output locales", () => {
  const combos = allCombinations();

  it("has 1728 combinations", () => expect(combos).toHaveLength(1728));

  it("renders complete, deterministic, single-language outputs", () => {
    const outputs = new Set<string>();
    for (const combo of combos) {
      for (const locale of LOCALES) {
        const text = compose(combo, locale);
        expect(text).toBe(compose(combo, locale));
        expect(text).not.toMatch(/\{\{|\}\}|undefined|```/);
        expect(text.endsWith("\n") && !text.endsWith("\n\n")).toBe(true);
        if (locale === "en") expect(text).not.toMatch(/[一-鿿]/);
        outputs.add(`${locale}\n${text}`);
      }
    }
    expect(outputs.size).toBe(combos.length * LOCALES.length);
  });

  it("keeps the style core in every combination", () => {
    for (const combo of combos) {
      const en = compose(combo, "en");
      expect(en).toContain("The eyes are exactly two identical, parallel, solid black vertical capsules (length to width 3:1).");
      expect(en).toContain("No irises, eye whites, reflections, eyelashes, eyebrows, mouth or nose.");
      expect(en).toContain("A 1:1 square canvas");
      expect(en).toContain("keep both eyes fully visible");
      expect(en).toContain("Generate one image.");
      const zh = compose(combo, "zh-CN");
      expect(zh).toContain("眼睛是两个大小相同、彼此平行的黑色单色竖向胶囊（长:宽 = 3:1）。");
      expect(zh).toContain("没有虹膜、眼白、反光、睫毛、眉毛、嘴巴和鼻子。");
      expect(zh).toContain("双眼完整露出");
      expect(zh).toContain("生成一张图片。");
    }
  });
});

describe("golden default outputs", () => {
  for (const locale of LOCALES) {
    it(`matches the appendix baseline (${locale})`, () => {
      const golden = readFileSync(path.join("tests", "unit", "golden", `grokbot-capsule-icon.default.${locale}.txt`), "utf8");
      expect(compose(defaults(), locale)).toBe(golden);
    });
  }

  it("defaults mirror the Korean short prompt", () => {
    const en = compose(defaults(), "en");
    for (const phrase of ["face in cream", "a pale oval blush on each cheek", "solid charcoal background", "peeking in from the lower left, head tilted clockwise", "Tilt the head about 15°", "pastel flat coloring"]) {
      expect(en).toContain(phrase);
    }
  });
});

describe("semantic regressions", () => {
  const withOption = (id: string, value: string, locale: Locale) => compose({ ...defaults(), [id]: value }, locale);

  it("lower-left and lower-right compositions mirror each other without leftovers", () => {
    const left = withOption("composition", "lower-left", "en");
    expect(left).toMatch(/lower left, head tilted clockwise; crop the face and hair at the left and bottom edges.*upper right/);
    expect(left).not.toMatch(/lower right|counterclockwise|upper left/);
    const right = withOption("composition", "lower-right", "en");
    expect(right).toMatch(/lower right, head tilted counterclockwise; crop the face and hair at the right and bottom edges.*upper left/);
    expect(right).not.toMatch(/lower left|upper right| clockwise/);
    const zhRight = withOption("composition", "lower-right", "zh-CN");
    expect(zhRight).toContain("从右下角探头");
    expect(zhRight).not.toMatch(/左下角|右上角|顺时针/);
  });

  it("uses only the selected tilt", () => {
    expect(withOption("tilt", "20", "en")).toContain("Tilt the head about 20°.");
    expect(withOption("tilt", "20", "en")).not.toMatch(/about 1[05]°/);
    expect(withOption("tilt", "10", "zh-CN")).toContain("头部倾斜约 10°。");
  });

  it("blush=none replaces the blush clause", () => {
    const en = withOption("blush", "none", "en");
    expect(en).toContain("with no blush on the cheeks.");
    expect(en).not.toContain("oval blush");
    expect(withOption("blush", "none", "zh-CN")).not.toContain("椭圆形腮红");
  });

  it("face color, coloring and outline swap cleanly", () => {
    expect(withOption("faceColor", "original-skin", "en")).toContain("A large, round face in the subject's original skin tone, with");
    expect(withOption("coloring", "vivid", "en")).toContain("bright, saturated flat coloring");
    expect(withOption("coloring", "vivid", "en")).not.toContain("pastel");
    expect(withOption("outline", "thin", "zh-CN")).toContain("细而柔和的描边");
    expect(withOption("outline", "thin", "zh-CN")).not.toContain("不加描边");
  });
});

describe("full variant (v1.0.0)", () => {
  const full = entry.variants.find((variant) => variant.id === "full")!;
  const composeFull = (selections: Selections, outputLocale: Locale) => composePrompt({ record: full, selections, outputLocale });
  const fullDefaults = () => defaultSelections(full.parameters);
  const combos = full.parameters.reduce<Selections[]>((all, parameter) => all.flatMap((combo) => parameter.options.map((option) => ({ ...combo, [parameter.id]: option.id }))), [{}]);

  it("is the second variant with its own seven parameters", () => {
    expect(entry.variants.map((variant) => variant.id)).toEqual(["short", "full"]);
    expect(full.templateVersion).toBe("1.1.0");
    expect(full.parameters.map((parameter) => parameter.id)).toEqual(["composition", "background", "faceColor", "blush", "shading", "outline", "featureBudget"]);
  });

  it("renders all 768 combinations × 2 locales completely", () => {
    expect(combos).toHaveLength(768);
    for (const combo of combos) {
      for (const locale of LOCALES) {
        const text = composeFull(combo, locale);
        expect(text).not.toMatch(/\{\{|\}\}|undefined/);
        expect(text.endsWith("\n") && !text.endsWith("\n\n")).toBe(true);
      }
      expect(composeFull(combo, "en")).toContain("Draw exactly two solid capsule shapes in a single near-black color.");
    }
  });

  for (const locale of LOCALES) {
    it(`matches its golden default (${locale})`, () => {
      expect(composeFull(fullDefaults(), locale)).toBe(readFileSync(path.join("tests", "unit", "golden", `grokbot-capsule-icon.full.${locale}.txt`), "utf8"));
    });
  }

  it("swaps whole paragraphs without contradictions", () => {
    const right = composeFull({ ...fullDefaults(), composition: "right-gentle" }, "en");
    expect(right).toContain("from the lower-right corner");
    expect(right).toContain("approximately 10–15 degrees counterclockwise");
    expect(right).not.toMatch(/lower-left|upper-right/);
    expect(composeFull({ ...fullDefaults(), blush: "none" }, "en")).not.toContain("oval blush on each cheek");
    expect(composeFull({ ...fullDefaults(), shading: "flat" }, "zh-CN")).not.toContain("一层宽阔而微弱的阴影");
    expect(composeFull({ ...fullDefaults(), featureBudget: "two" }, "zh-CN")).toContain("最多保留两项关键识别特征");
  });

  it("face color never contradicts a 'keep the original skin' rule", () => {
    const cream = composeFull({ ...fullDefaults(), faceColor: "cream" }, "en");
    expect(cream).toContain("Draw the face as broad, smooth areas of color in cream.");
    expect(cream).not.toMatch(/standardize skin|original skin tone or surface color/);
    expect(composeFull(fullDefaults(), "en")).toContain("in the subject's original skin tone or surface color (never a preset color).");
    expect(composeFull({ ...fullDefaults(), outline: "thin" }, "zh-CN")).toContain("细而柔和的描边");
    expect(composeFull({ ...fullDefaults(), outline: "thin" }, "zh-CN")).not.toContain("几乎没有轮廓线");
  });

  it("uses natural section headings", () => {
    const en = composeFull(fullDefaults(), "en");
    for (const heading of ["[Goal]", "[What to keep from the original]", "[Face]", "[Eyes]", "[Composition]", "[Hair, accessories and color]", "[Background and what to avoid]", "[When rules conflict]", "[Output and follow-up edits]"]) {
      expect(en).toContain(heading);
    }
    expect(composeFull(fullDefaults(), "zh-CN")).toContain("[规则冲突时]");
  });
});
