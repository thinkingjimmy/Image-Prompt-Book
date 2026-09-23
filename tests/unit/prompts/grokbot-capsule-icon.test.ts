/**
 * [INPUT]: 依赖 scripts/lib/appendix 的附录解析，依赖 ../helpers 的 promptEntry/combinations/composer，依赖 content/prompts/grokbot-capsule-icon
 * [OUTPUT]: 首个条目的专属测试：文件与规范性附录逐项一致（发布字段除外）、韩文原文 SHA-256、默认输出与附录独立替换结果一致（golden）、风格核心与选项语义回归（AC-06–AC-11）
 * [POS]: tests/unit/prompts 的条目套件；通用的全组合渲染由 content.test.ts 负责，这里只证明本条目的语义，不证明生图质量
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "@/i18n/config";
import { readAppendix } from "../../../scripts/lib/appendix";
import { combinations, composer, promptEntry } from "../helpers";

const SLUG = "grokbot-capsule-icon";
const SHORT_ORIGINAL_SHA256 = "ce60f5b77ecb214acf8a419c2f85057853fd357332966ec1bc1c467bc26155fd";
const FULL_ORIGINAL_SHA256 = "b0ab40da1d0399c587be0a1cfe4ebb46bed0bb50c86436420c036d1106f0acbc";

const dir = path.join("content", "prompts", SLUG);
const read = (name: string) => readFileSync(path.join(dir, name), "utf8");
const appendix = readAppendix(SLUG);
const entry = promptEntry(SLUG);
const full = entry.variants.find((variant) => variant.id === "full")!;
const compose = composer(entry);
const composeFull = composer(full);

type AppendixParameter = { id: string; default: string; options: { id: string; replacements: Record<string, string> }[] };

/** Golden oracle: plain split/join on the appendix, deliberately independent of composePrompt. */
function appendixDefault(templates: Record<Locale, string>, parameters: unknown, locale: Locale): string {
  let text = templates[locale];
  for (const parameter of (parameters as { parameters: AppendixParameter[] }).parameters) {
    const option = parameter.options.find((item) => item.id === parameter.default)!;
    text = text.split(`{{${parameter.id}}}`).join(option.replacements[locale]!);
  }
  return `${text}\n`;
}

// Publishing happens after the import, so fidelity ignores the publication fields.
const unpublished = (meta: unknown) => ({ ...(meta as object), status: null, publishedAt: null, updatedAt: null });

describe("import fidelity (normative appendix)", () => {
  it("meta, page copy, parameters and examples equal the appendix", () => {
    expect(unpublished(JSON.parse(read("meta.json")))).toEqual(unpublished(appendix.meta));
    expect(JSON.parse(read("en.json"))).toEqual(appendix.locales.en);
    expect(JSON.parse(read("zh-CN.json"))).toEqual(appendix.locales["zh-CN"]);
    expect(JSON.parse(read("parameters.json"))).toEqual(appendix.parameters);
    expect(JSON.parse(read("examples.json"))).toEqual(appendix.examples);
    expect(JSON.parse(read("full/parameters.json"))).toEqual(appendix.full.parameters);
  });

  it("templates equal the appendix fences byte for byte", () => {
    for (const locale of LOCALES) {
      expect(read(`template.${locale}.txt`)).toBe(`${appendix.templates[locale]}\n`);
      expect(read(`full/template.${locale}.txt`)).toBe(`${appendix.full.templates[locale]}\n`);
    }
  });

  it("ATTRIBUTION.md carries both attribution texts", () => {
    expect(read("ATTRIBUTION.md")).toContain(appendix.attribution.en);
    expect(read("ATTRIBUTION.md")).toContain(appendix.attribution["zh-CN"]);
  });

  it("the Korean short original is unchanged and UTF-8/LF", () => {
    const original = readFileSync(path.join(dir, "original.ko.txt"));
    expect(createHash("sha256").update(original).digest("hex")).toBe(SHORT_ORIGINAL_SHA256);
    expect(original.toString("utf8")).toBe(`${appendix.original}\n`);
    expect(original.toString("utf8")).not.toContain("\r");
  });

  it("the v1 full original remains complete in the appendix", () => {
    expect(appendix.fullOriginal.match(/^\[[^\]]+\]$/gm)).toEqual(["[목표]", "[원본에서 가져올 정보]", "[얼굴]", "[눈]", "[구도]", "[머리카락·장식·채색]", "[배경과 제외 요소]", "[충돌 처리]", "[실행과 후속 수정]"]);
    expect(createHash("sha256").update(`${appendix.fullOriginal}\n`).digest("hex")).toBe(FULL_ORIGINAL_SHA256);
  });
});

describe("golden default outputs", () => {
  for (const locale of LOCALES) {
    it(`short and full defaults match the appendix (${locale})`, () => {
      expect(compose({}, locale)).toBe(appendixDefault(appendix.templates, appendix.parameters, locale));
      expect(composeFull({}, locale)).toBe(appendixDefault(appendix.full.templates, appendix.full.parameters, locale));
    });
  }

  it("short defaults mirror the Korean short prompt", () => {
    const en = compose({}, "en");
    for (const phrase of ["face in cream", "a pale oval blush on each cheek", "solid charcoal background", "peeking in from the lower left, head tilted clockwise", "Tilt the head about 15°", "pastel flat coloring"]) {
      expect(en).toContain(phrase);
    }
  });
});

describe("short version (v2.0.0)", () => {
  it("declares seven parameters, each used once per template", () => {
    expect(entry.meta.templateVersion).toBe("2.0.0");
    expect(entry.variants.map((variant) => variant.id)).toEqual(["short", "full"]);
    expect(entry.parameters.map((parameter) => parameter.id)).toEqual(["faceColor", "blush", "background", "composition", "tilt", "coloring", "outline"]);
    expect(combinations(entry.parameters)).toHaveLength(1728);
    for (const locale of LOCALES) expect(entry.templates[locale]!.match(/\{\{\w+\}\}/g)).toHaveLength(7);
  });

  it("keeps the style core in every combination", () => {
    for (const combo of combinations(entry.parameters)) {
      const en = compose(combo, "en");
      for (const rule of [
        "The eyes are exactly two identical, parallel, solid black vertical capsules (length to width 3:1).",
        "No irises, eye whites, reflections, eyelashes, eyebrows, mouth or nose.",
        "A 1:1 square canvas",
        "keep both eyes fully visible",
        "Generate one image.",
      ]) {
        expect(en).toContain(rule);
      }
      const zh = compose(combo, "zh-CN");
      for (const rule of ["眼睛是两个大小相同、彼此平行的黑色单色竖向胶囊（长:宽 = 3:1）。", "没有虹膜、眼白、反光、睫毛、眉毛、嘴巴和鼻子。", "双眼完整露出", "生成一张图片。"]) {
        expect(zh).toContain(rule);
      }
    }
  });

  it("lower-left and lower-right compositions mirror each other without leftovers", () => {
    const left = compose({ composition: "lower-left" }, "en");
    expect(left).toMatch(/lower left, head tilted clockwise; crop the face and hair at the left and bottom edges.*upper right/);
    expect(left).not.toMatch(/lower right|counterclockwise|upper left/);
    const right = compose({ composition: "lower-right" }, "en");
    expect(right).toMatch(/lower right, head tilted counterclockwise; crop the face and hair at the right and bottom edges.*upper left/);
    expect(right).not.toMatch(/lower left|upper right| clockwise/);
    const zhRight = compose({ composition: "lower-right" }, "zh-CN");
    expect(zhRight).toContain("从右下角探头");
    expect(zhRight).not.toMatch(/左下角|右上角|顺时针/);
  });

  it("tilt, blush, face color, coloring and outline swap cleanly", () => {
    expect(compose({ tilt: "20" }, "en")).toContain("Tilt the head about 20°.");
    expect(compose({ tilt: "20" }, "en")).not.toMatch(/about 1[05]°/);
    expect(compose({ tilt: "10" }, "zh-CN")).toContain("头部倾斜约 10°。");
    expect(compose({ blush: "none" }, "en")).toContain("with no blush on the cheeks.");
    expect(compose({ blush: "none" }, "en")).not.toContain("oval blush");
    expect(compose({ blush: "none" }, "zh-CN")).not.toContain("椭圆形腮红");
    expect(compose({ faceColor: "original-skin" }, "en")).toContain("A large, round face in the subject's original skin tone, with");
    expect(compose({ coloring: "vivid" }, "en")).toContain("bright, saturated flat coloring");
    expect(compose({ coloring: "vivid" }, "en")).not.toContain("pastel");
    expect(compose({ outline: "thin" }, "zh-CN")).toContain("细而柔和的描边");
    expect(compose({ outline: "thin" }, "zh-CN")).not.toContain("不加描边");
  });
});

describe("full version (v1.1.0)", () => {
  it("has its own seven parameters", () => {
    expect(full.templateVersion).toBe("1.1.0");
    expect(full.parameters.map((parameter) => parameter.id)).toEqual(["composition", "background", "faceColor", "blush", "shading", "outline", "featureBudget"]);
    expect(combinations(full.parameters)).toHaveLength(768);
  });

  it("keeps the eye rule in every combination", () => {
    for (const combo of combinations(full.parameters)) expect(composeFull(combo, "en")).toContain("Draw exactly two solid capsule shapes in a single near-black color.");
  });

  it("swaps whole paragraphs without contradictions", () => {
    const right = composeFull({ composition: "right-gentle" }, "en");
    expect(right).toContain("from the lower-right corner");
    expect(right).toContain("approximately 10–15 degrees counterclockwise");
    expect(right).not.toMatch(/lower-left|upper-right/);
    expect(composeFull({ blush: "none" }, "en")).not.toContain("oval blush on each cheek");
    expect(composeFull({ shading: "flat" }, "zh-CN")).not.toContain("一层宽阔而微弱的阴影");
    expect(composeFull({ featureBudget: "two" }, "zh-CN")).toContain("最多保留两项关键识别特征");
  });

  it("face color never contradicts a 'keep the original skin' rule", () => {
    const cream = composeFull({ faceColor: "cream" }, "en");
    expect(cream).toContain("Draw the face as broad, smooth areas of color in cream.");
    expect(cream).not.toMatch(/standardize skin|original skin tone or surface color/);
    expect(composeFull({}, "en")).toContain("in the subject's original skin tone or surface color (never a preset color).");
    expect(composeFull({ outline: "thin" }, "zh-CN")).toContain("细而柔和的描边");
    expect(composeFull({ outline: "thin" }, "zh-CN")).not.toContain("几乎没有轮廓线");
  });

  it("uses natural section headings", () => {
    const en = composeFull({}, "en");
    for (const heading of ["[Goal]", "[What to keep from the original]", "[Face]", "[Eyes]", "[Composition]", "[Hair, accessories and color]", "[Background and what to avoid]", "[When rules conflict]", "[Output and follow-up edits]"]) {
      expect(en).toContain(heading);
    }
    expect(composeFull({}, "zh-CN")).toContain("[规则冲突时]");
  });
});
