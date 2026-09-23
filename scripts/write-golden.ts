/**
 * [INPUT]: 依赖 scripts/lib/appendix 读取附录模板与参数默认值
 * [OUTPUT]: 写出 tests/unit/golden/<slug>.default.<locale>.txt
 * [POS]: scripts 的 golden 基线生成器；刻意用 split/join 独立替换，不调用 composePrompt，使 golden 测试能发现引擎回归
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { writeFileSync } from "node:fs";
import path from "node:path";
import { readAppendix } from "./lib/appendix";

type Param = { id: string; default: string; options: { id: string; replacements: Record<string, string> }[] };
const slug = process.argv[2] ?? "grokbot-capsule-icon";
const appendix = readAppendix(slug);
const { parameters } = appendix.parameters as { parameters: Param[] };

for (const locale of ["en", "zh-CN"] as const) {
  let text = appendix.templates[locale];
  for (const parameter of parameters) {
    const option = parameter.options.find((item) => item.id === parameter.default)!;
    text = text.split(`{{${parameter.id}}}`).join(option.replacements[locale]!);
  }
  const file = path.join("tests", "unit", "golden", `${slug}.default.${locale}.txt`);
  writeFileSync(file, `${text}\n`);
  console.log(`wrote ${file}`);
}
