/**
 * [INPUT]: 依赖 node:fs 读取 docs/examples/<slug>.md
 * [OUTPUT]: 对外提供 readAppendix()，按章节标题提取附录中的 JSON/text code fence（默认版本读 §12 v2 短版，完整版读 §12.11–12.13 v1.1.0）
 * [POS]: scripts/lib 的附录解析器，被 import-appendix 与 content-fidelity 单元测试共用，保证“导入”与“校验”读取同一基线
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFileSync } from "node:fs";
import path from "node:path";

type Fence = { lang: string; body: string };

/** Returns the body of every fenced block that appears after `heading` and before the next heading of the same or higher level. */
function fencesUnder(markdown: string, heading: string): Fence[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const start = lines.findIndex((line) => line.startsWith(heading));
  if (start === -1) throw new Error(`Appendix heading not found: ${heading}`);
  const level = heading.match(/^#+/)?.[0].length ?? 2;

  const fences: Fence[] = [];
  let current: { lang: string; lines: string[] } | null = null;
  for (const line of lines.slice(start + 1)) {
    if (!current) {
      const heading = line.match(/^(#+)\s/);
      if (heading && heading[1]!.length <= level) break;
      const open = line.match(/^```(\w*)\s*$/);
      if (open) current = { lang: open[1] ?? "", lines: [] };
      continue;
    }
    if (line === "```") {
      fences.push({ lang: current.lang, body: current.lines.join("\n") });
      current = null;
    } else {
      current.lines.push(line);
    }
  }
  return fences;
}

function onlyFence(markdown: string, heading: string, lang: string, index = 0): string {
  const fence = fencesUnder(markdown, heading).filter((item) => item.lang === lang)[index];
  if (!fence) throw new Error(`No \`\`\`${lang} fence #${index} under ${heading}`);
  return fence.body;
}

export function readAppendix(slug: string) {
  const file = path.join(process.cwd(), "docs", "examples", `${slug}.md`);
  const markdown = readFileSync(file, "utf8");

  // §12 (v2.0.0, short prompt) is the current template; §3–§10 remain the v1 full-prompt record.
  return {
    meta: JSON.parse(onlyFence(markdown, "### 12.2", "json")) as unknown,
    locales: {
      en: JSON.parse(onlyFence(markdown, "### 12.3", "json")) as unknown,
      "zh-CN": JSON.parse(onlyFence(markdown, "### 12.4", "json")) as unknown,
    },
    original: onlyFence(markdown, "### 12.1", "text"),
    templates: {
      en: onlyFence(markdown, "### 12.5", "text"),
      "zh-CN": onlyFence(markdown, "### 12.6", "text"),
    },
    parameters: JSON.parse(onlyFence(markdown, "### 12.7", "json")) as unknown,
    examples: JSON.parse(onlyFence(markdown, "### 12.8", "json")) as unknown,
    attribution: {
      en: onlyFence(markdown, "### 12.9", "text"),
      "zh-CN": onlyFence(markdown, "### 12.10", "text"),
    },
    /** The full prompt's Korean original (§5); the site's "full" variant is the v1.1.0 adaptation in §12.11–12.13. */
    fullOriginal: onlyFence(markdown, "## 5.", "text"),
    full: {
      templates: {
        en: onlyFence(markdown, "### 12.11", "text"),
        "zh-CN": onlyFence(markdown, "### 12.12", "text"),
      },
      parameters: JSON.parse(onlyFence(markdown, "### 12.13", "json")) as unknown,
    },
  };
}
