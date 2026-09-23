/**
 * [INPUT]: 依赖 @/lib/prompt/template 的解析与编排函数
 * [OUTPUT]: 模板引擎单测：白名单 token、恶意/畸形输入、全部同名替换、段落切分、选择回退
 * [POS]: tests/unit 的引擎级测试，与内容无关；grokbot-prompt.test.ts 覆盖真实内容
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { describe, expect, it } from "vitest";
import type { Parameter } from "@/lib/content/schema";
import { composePrompt, parseTemplate, sanitizeSelections, TemplateError, toParagraphs } from "@/lib/prompt/template";

const color: Parameter = {
  id: "color",
  type: "select",
  renderAs: "inline",
  default: "red",
  options: [
    { id: "red", labels: { en: "Red", "zh-CN": "红" }, replacements: { en: "red", "zh-CN": "红色" } },
    { id: "blue", labels: { en: "Blue", "zh-CN": "蓝" }, replacements: { en: "<b>blue</b> {not a token}", "zh-CN": "蓝色" } },
  ],
};
const record = { parameters: [color], templates: { en: "A {{color}} cat and a {{color}} dog.\n", "zh-CN": "一只{{color}}的猫。\n" } };

describe("parseTemplate", () => {
  it("splits text and tokens", () => {
    expect(parseTemplate("a {{x}} b")).toEqual([
      { type: "text", value: "a " },
      { type: "token", id: "x" },
      { type: "text", value: " b" },
    ]);
  });

  it.each(["{{ x }}", "{{x", "x}}", "{{x.y}}", "{{constructor()}}", "{{{x}}}", "{{1x}}"])("rejects malformed token %s", (source) => {
    expect(() => parseTemplate(source)).toThrow(TemplateError);
  });
});

describe("composePrompt", () => {
  it("replaces every occurrence and treats replacements as plain leaf strings", () => {
    expect(composePrompt({ record, selections: { color: "blue" }, outputLocale: "en" })).toBe("A <b>blue</b> {not a token} cat and a <b>blue</b> {not a token} dog.\n");
  });

  it("falls back to defaults for unknown or hostile selections", () => {
    const out = composePrompt({ record, selections: { color: "__proto__", other: "x" }, outputLocale: "zh-CN" });
    expect(out).toBe("一只红色的猫。\n");
  });

  it("normalizes CRLF and trailing newlines", () => {
    const crlf = { parameters: [color], templates: { en: "x {{color}}\r\n\r\n\r\n" } };
    expect(composePrompt({ record: crlf, selections: {}, outputLocale: "en" })).toBe("x red\n");
  });

  it("throws for an undeclared token", () => {
    expect(() => composePrompt({ record: { parameters: [], templates: { en: "{{x}}" } }, selections: {}, outputLocale: "en" })).toThrow(TemplateError);
  });
});

describe("sanitizeSelections", () => {
  it("reports invalid known keys only", () => {
    expect(sanitizeSelections([color], { color: "green", junk: "1" })).toEqual({ selections: { color: "red" }, invalid: ["color"] });
  });
});

describe("toParagraphs", () => {
  it("detects headings and isolates block tokens", () => {
    const paragraphs = toParagraphs(parseTemplate("[Face]\n\nLine one\nline two {{a}}.\n\n{{b}}\n\nEnd\n"));
    expect(paragraphs).toEqual([
      { kind: "heading", text: "Face" },
      { kind: "body", nodes: [{ type: "text", value: "Line one\nline two " }, { type: "token", id: "a" }, { type: "text", value: "." }] },
      { kind: "body", nodes: [{ type: "token", id: "b" }] },
      { kind: "body", nodes: [{ type: "text", value: "End" }] },
    ]);
  });
});
