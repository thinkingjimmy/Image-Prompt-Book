/**
 * [INPUT]: 依赖 docs/examples/<slug>.md 规范性附录的章节与 code fence
 * [OUTPUT]: 写出 content/prompts/<slug>/ 下的 meta/en/zh-CN/original/template/parameters/examples/ATTRIBUTION 文件与 full/ 完整版变体
 * [POS]: scripts 的内容导入器，被维护者手动执行；lib/appendix 负责解析，tests/unit/prompts 的保真测试反向校验导入结果
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { readAppendix } from "./lib/appendix";

const slug = process.argv[2] ?? "grokbot-capsule-icon";
const appendix = readAppendix(slug);
const outDir = path.join(process.cwd(), "content", "prompts", slug);
mkdirSync(outDir, { recursive: true });

const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const text = (value: string) => `${value.replace(/\r\n/g, "\n").replace(/\n+$/, "")}\n`;

const files: Record<string, string> = {
  "meta.json": json(appendix.meta),
  "en.json": json(appendix.locales.en),
  "zh-CN.json": json(appendix.locales["zh-CN"]),
  "original.ko.txt": text(appendix.original),
  "template.en.txt": text(appendix.templates.en),
  "template.zh-CN.txt": text(appendix.templates["zh-CN"]),
  "parameters.json": json(appendix.parameters),
  "full/template.en.txt": text(appendix.full.templates.en),
  "full/template.zh-CN.txt": text(appendix.full.templates["zh-CN"]),
  "full/parameters.json": json(appendix.full.parameters),
  "examples.json": json(appendix.examples),
  "ATTRIBUTION.md": [
    `# Attribution — ${slug}`,
    "",
    "Imported from the normative appendix. The prompt, its translations and parameterized adaptations follow the source license below and are NOT covered by the repository MIT license. Example images carry separate rights recorded in `examples.json`.",
    "",
    "## en",
    "",
    "```text",
    appendix.attribution.en,
    "```",
    "",
    "## zh-CN",
    "",
    "```text",
    appendix.attribution["zh-CN"],
    "```",
    "",
  ].join("\n"),
};

mkdirSync(path.join(outDir, "full"), { recursive: true });
for (const [name, body] of Object.entries(files)) {
  writeFileSync(path.join(outDir, name), body, "utf8");
  console.log(`wrote content/prompts/${slug}/${name}`);
}
