/**
 * [INPUT]: 依赖 scripts/lib/appendix 的附录解析，依赖 content/prompts/grokbot-capsule-icon 的导入文件
 * [OUTPUT]: 导入保真测试：各文件与规范性附录 §12（v2 短版）逐项一致、韩文短版原文 SHA-256 不变、v1 完整原文仍完整保留在附录（AC-10/AC-11）
 * [POS]: tests/unit 的内容基线守卫；原文哈希变化即视为来源版本更新，需要显式评审
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readAppendix } from "../../scripts/lib/appendix";

const SLUG = "grokbot-capsule-icon";
const SHORT_ORIGINAL_SHA256 = "ce60f5b77ecb214acf8a419c2f85057853fd357332966ec1bc1c467bc26155fd";
const dir = path.join("content", "prompts", SLUG);
const read = (name: string) => readFileSync(path.join(dir, name), "utf8");
const appendix = readAppendix(SLUG);

describe("appendix §12 import fidelity", () => {
  it("meta.json, en.json and zh-CN.json equal the appendix", () => {
    expect(JSON.parse(read("meta.json"))).toEqual(appendix.meta);
    expect(JSON.parse(read("en.json"))).toEqual(appendix.locales.en);
    expect(JSON.parse(read("zh-CN.json"))).toEqual(appendix.locales["zh-CN"]);
  });

  it("templates equal the appendix fences byte for byte", () => {
    expect(read("template.en.txt")).toBe(`${appendix.templates.en}\n`);
    expect(read("template.zh-CN.txt")).toBe(`${appendix.templates["zh-CN"]}\n`);
  });

  it("the full variant files equal appendix §6–§8", () => {
    expect(read("full/template.en.txt")).toBe(`${appendix.full.templates.en}\n`);
    expect(read("full/template.zh-CN.txt")).toBe(`${appendix.full.templates["zh-CN"]}\n`);
    expect(JSON.parse(read("full/parameters.json"))).toEqual(appendix.full.parameters);
  });

  it("parameters.json and examples.json equal the appendix", () => {
    expect(JSON.parse(read("parameters.json"))).toEqual(appendix.parameters);
    expect(JSON.parse(read("examples.json"))).toEqual(appendix.examples);
  });

  it("example images stay pending until display rights are recorded", () => {
    for (const example of JSON.parse(read("examples.json")) as { rights: { status: string } }[]) expect(example.rights.status).toBe("pending");
  });

  it("ATTRIBUTION.md carries both appendix attribution texts", () => {
    const attribution = read("ATTRIBUTION.md");
    expect(attribution).toContain(appendix.attribution.en);
    expect(attribution).toContain(appendix.attribution["zh-CN"]);
  });
});

describe("Korean originals", () => {
  const original = readFileSync(path.join(dir, "original.ko.txt"));

  it("the short original is unchanged (SHA-256 snapshot) and UTF-8/LF", () => {
    expect(createHash("sha256").update(original).digest("hex")).toBe(SHORT_ORIGINAL_SHA256);
    const text = original.toString("utf8");
    expect(text).toBe(`${appendix.original}\n`);
    expect(text).not.toContain("\r");
  });

  it("the v1 full original remains complete in the appendix", () => {
    const sections = appendix.fullOriginal.match(/^\[[^\]]+\]$/gm);
    expect(sections).toEqual(["[목표]", "[원본에서 가져올 정보]", "[얼굴]", "[눈]", "[구도]", "[머리카락·장식·채색]", "[배경과 제외 요소]", "[충돌 처리]", "[실행과 후속 수정]"]);
    expect(createHash("sha256").update(`${appendix.fullOriginal}\n`).digest("hex")).toBe("b0ab40da1d0399c587be0a1cfe4ebb46bed0bb50c86436420c036d1106f0acbc");
  });
});
