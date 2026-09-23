/**
 * [INPUT]: 依赖 scripts/lib/appendix 读取附录模板与参数默认值
 * [OUTPUT]: 写出 tests/unit/golden/<slug>.{default,full}.<locale>.txt（默认精简版与完整版）
 * [POS]: scripts 的 golden 基线生成器；刻意用 split/join 独立替换，不调用 composePrompt，使 golden 测试能发现引擎回归
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { readAppendix } from "./lib/appendix";

type Param = { id: string; default: string; options: { id: string; replacements: Record<string, string> }[] };
const slug = process.argv[2] ?? "grokbot-capsule-icon";
const appendix = readAppendix(slug);
const variants = [
  { suffix: "default", templates: appendix.templates, parameters: (appendix.parameters as { parameters: Param[] }).parameters },
  { suffix: "full", templates: appendix.full.templates, parameters: (appendix.full.parameters as { parameters: Param[] }).parameters },
];

for (const variant of variants) {
  for (const locale of ["en", "zh-CN"] as const) {
    let text = variant.templates[locale];
    for (const parameter of variant.parameters) {
      const option = parameter.options.find((item) => item.id === parameter.default)!;
      text = text.split(`{{${parameter.id}}}`).join(option.replacements[locale]!);
    }
    const file = path.join("tests", "unit", "golden", `${slug}.${variant.suffix}.${locale}.txt`);
    writeFileSync(file, `${text}\n`);
    console.log(`wrote ${file}`);
  }
}
