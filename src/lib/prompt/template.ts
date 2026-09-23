/**
 * [INPUT]: 依赖 @/lib/content/schema 的 Parameter 类型，依赖 @/i18n/config 的 Locale
 * [OUTPUT]: 对外提供 parseTemplate/templateTokenIds/toParagraphs/defaultSelections/sanitizeSelections/composePrompt/normalizeOutput 与 TemplateNode/Paragraph/Selections 类型
 * [POS]: lib/prompt 的纯函数核心，服务端（默认输出/校验）与客户端（编辑器/复制）共用同一实现；share.ts 与 draft.ts 依赖其 sanitizeSelections
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Locale } from "@/i18n/config";
import type { Parameter } from "@/lib/content/schema";

export type TemplateNode = { type: "text"; value: string } | { type: "token"; id: string };
export type Selections = Record<string, string>;
export type Paragraph = { kind: "heading"; text: string } | { kind: "body"; nodes: TemplateNode[] };

export class TemplateError extends Error {}

const TOKEN = /\{\{([A-Za-z][A-Za-z0-9]*)\}\}/g;

/** Splits a template into text and whitelisted `{{parameterId}}` tokens. Any other brace sequence is rejected. */
export function parseTemplate(source: string): TemplateNode[] {
  const text = source.replace(/\r\n?/g, "\n");
  const nodes: TemplateNode[] = [];
  let cursor = 0;
  for (const match of text.matchAll(TOKEN)) {
    if (match.index > cursor) nodes.push({ type: "text", value: text.slice(cursor, match.index) });
    nodes.push({ type: "token", id: match[1]! });
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) nodes.push({ type: "text", value: text.slice(cursor) });

  nodes.forEach((node, index) => {
    if (node.type !== "token") return;
    const before = nodes[index - 1];
    const after = nodes[index + 1];
    if ((before?.type === "text" && before.value.endsWith("{")) || (after?.type === "text" && after.value.startsWith("}"))) {
      throw new TemplateError(`Malformed token around {{${node.id}}}`);
    }
  });
  for (const node of nodes) {
    if (node.type === "text" && /\{\{|\}\}/.test(node.value)) {
      throw new TemplateError(`Malformed token near: ${JSON.stringify(node.value.slice(Math.max(0, node.value.search(/\{\{|\}\}/) - 20), node.value.search(/\{\{|\}\}/) + 20))}`);
    }
  }
  return nodes;
}

export function templateTokenIds(nodes: TemplateNode[]): string[] {
  return [...new Set(nodes.flatMap((node) => (node.type === "token" ? [node.id] : [])))];
}

/** Groups nodes into blank-line separated paragraphs; `[Section]` lines become headings. */
export function toParagraphs(nodes: TemplateNode[]): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  let current: TemplateNode[] = [];
  const flush = () => {
    const trimmed = trimNodes(current);
    current = [];
    if (trimmed.length === 0) return;
    const only = trimmed.length === 1 ? trimmed[0] : undefined;
    const heading = only?.type === "text" ? only.value.match(/^\[(.+)\]$/) : null;
    paragraphs.push(heading ? { kind: "heading", text: heading[1]! } : { kind: "body", nodes: trimmed });
  };

  for (const node of nodes) {
    if (node.type === "token") {
      current.push(node);
      continue;
    }
    const parts = node.value.split(/\n{2,}/);
    parts.forEach((part, index) => {
      if (index > 0) flush();
      if (part) current.push({ type: "text", value: part });
    });
  }
  flush();
  return paragraphs;
}

function trimNodes(nodes: TemplateNode[]): TemplateNode[] {
  const out = nodes.map((node) => ({ ...node }));
  const first = out[0];
  if (first?.type === "text") first.value = first.value.replace(/^\n+/, "");
  const last = out.at(-1);
  if (last?.type === "text") last.value = last.value.replace(/\n+$/, "");
  return out.filter((node) => node.type === "token" || node.value.length > 0);
}

export function defaultSelections(parameters: readonly Parameter[]): Selections {
  return Object.fromEntries(parameters.map((parameter) => [parameter.id, parameter.default]));
}

/** Keeps only known parameter/option IDs; anything else falls back to the default and is reported. */
export function sanitizeSelections(parameters: readonly Parameter[], input: Readonly<Record<string, unknown>> | null | undefined) {
  const selections: Selections = {};
  const invalid: string[] = [];
  for (const parameter of parameters) {
    const value = input?.[parameter.id];
    if (typeof value === "string" && parameter.options.some((option) => option.id === value)) {
      selections[parameter.id] = value;
    } else {
      if (value !== undefined) invalid.push(parameter.id);
      selections[parameter.id] = parameter.default;
    }
  }
  return { selections, invalid };
}

export function replacementFor(parameter: Parameter, optionId: string, locale: Locale): string {
  const option = parameter.options.find((item) => item.id === optionId) ?? parameter.options.find((item) => item.id === parameter.default);
  const value = option?.replacements[locale];
  if (value === undefined) throw new TemplateError(`Missing ${locale} replacement for ${parameter.id}=${optionId}`);
  return value;
}

export function normalizeOutput(text: string): string {
  return `${text.replace(/\r\n?/g, "\n").replace(/\n+$/, "")}\n`;
}

const parsedCache = new Map<string, TemplateNode[]>();
function parseCached(source: string): TemplateNode[] {
  let nodes = parsedCache.get(source);
  if (!nodes) {
    nodes = parseTemplate(source);
    parsedCache.set(source, nodes);
  }
  return nodes;
}

export type ComposableRecord = {
  parameters: readonly Parameter[];
  templates: Partial<Record<Locale, string>>;
};

/** Pure: the same record, selections and locale always produce the same complete plain-text prompt. */
export function composePrompt({ record, selections, outputLocale }: { record: ComposableRecord; selections: Readonly<Record<string, unknown>>; outputLocale: Locale }): string {
  const template = record.templates[outputLocale];
  if (template === undefined) throw new TemplateError(`No ${outputLocale} template`);
  const byId = new Map(record.parameters.map((parameter) => [parameter.id, parameter]));
  const { selections: safe } = sanitizeSelections(record.parameters, selections);

  const text = parseCached(template)
    .map((node) => {
      if (node.type === "text") return node.value;
      const parameter = byId.get(node.id);
      if (!parameter) throw new TemplateError(`Undeclared token {{${node.id}}}`);
      return replacementFor(parameter, safe[node.id]!, outputLocale);
    })
    .join("");
  return normalizeOutput(text);
}
