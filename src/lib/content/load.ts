/**
 * [INPUT]: 依赖 node:fs/path 读取内容目录，依赖 image-size 读取真实尺寸，依赖 ./schema 的单文件 schema，依赖 @/lib/prompt/template 的 parseTemplate
 * [OUTPUT]: 对外提供 loadContentLibrary()、publicationBlockers()、PromptEntry/PromptVariant/ContentLibrary 类型
 * [POS]: lib/content 的加载与跨文件校验器，被 catalog.ts（运行时）与 scripts/check-content.ts（CI）共用，是“内容是否合法”的唯一判定；支持多版本（variants，如精简/完整），逐版本校验模板与参数
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";
import type { z } from "zod";
import { LOCALES, type Locale } from "@/i18n/config";
import { parseTemplate, templateTokenIds } from "@/lib/prompt/template";
import {
  examplesSchema,
  localeContentSchema,
  metaSchema,
  parametersSchema,
  taxonomySchema,
  type Example,
  type LocaleContent,
  type Parameter,
  type PromptMeta,
  type Taxonomy,
} from "./schema";

/** One editable version of a prompt. Entries without `meta.variants` have a single "default" variant. */
export type PromptVariant = {
  id: string;
  labels: Record<Locale, string> | null;
  templateVersion: string;
  templates: Partial<Record<Locale, string>>;
  parameters: Parameter[];
};

export type PromptEntry = {
  meta: PromptMeta;
  content: Partial<Record<Locale, LocaleContent>>;
  original: string;
  /** The default (first) variant's template and parameters, used for SEO, structured data and defaults. */
  templates: Partial<Record<Locale, string>>;
  parameters: Parameter[];
  variants: PromptVariant[];
  examples: Example[];
  attribution: Partial<Record<Locale, string>>;
  /** Repository-relative directory, used for "improve on GitHub" links. */
  repoPath: string;
};

export type ContentLibrary = {
  taxonomy: Taxonomy;
  entries: PromptEntry[];
  issues: string[];
};

export type LoadOptions = {
  /** Directory holding taxonomy.json and prompts/. */
  root: string;
  /** Only fixture roots may contain `fixture: true` records. */
  allowFixtures: boolean;
};

/** Every reason an entry may not be public. Empty means the published predicate holds. */
export function publicationBlockers(entry: PromptEntry): string[] {
  const { meta } = entry;
  const blockers: string[] = [];
  if (meta.status !== "published") blockers.push(`status is ${meta.status}`);
  if (!meta.publishedAt) blockers.push("publishedAt is missing");
  if (entry.examples.length === 0) blockers.push("at least one real example image is required");
  for (const locale of LOCALES) {
    if (!entry.content[locale]) blockers.push(`missing ${locale} page content`);
    for (const variant of entry.variants) if (!variant.templates[locale]) blockers.push(`missing ${locale} template${variant.id === "default" ? "" : ` (${variant.id})`}`);
    if (!entry.attribution[locale]) blockers.push(`missing ${locale} attribution`);
  }
  return blockers;
}

function readJson<T extends z.ZodType>(file: string, schema: T, issues: string[], label: string): z.infer<T> | null {
  if (!existsSync(file)) {
    issues.push(`${label}: file not found`);
    return null;
  }
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    issues.push(`${label}: invalid JSON (${(error as Error).message})`);
    return null;
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) issues.push(`${label}: ${issue.path.join(".") || "(root)"} ${issue.message}`);
    return null;
  }
  return result.data;
}

function readText(file: string, issues: string[], label: string): string | null {
  if (!existsSync(file)) {
    issues.push(`${label}: file not found`);
    return null;
  }
  const text = readFileSync(file, "utf8");
  if (text.includes("\r")) issues.push(`${label}: must use LF line endings`);
  if (!text.endsWith("\n") || text.endsWith("\n\n")) issues.push(`${label}: must end with exactly one newline`);
  if (text.trim().length === 0) issues.push(`${label}: is empty`);
  if (text.charCodeAt(0) === 0xfeff) issues.push(`${label}: must not start with a BOM`);
  return text;
}

/** ATTRIBUTION.md holds one ```text block per locale under a `## <locale>` heading. */
function parseAttribution(markdown: string): Partial<Record<Locale, string>> {
  const result: Partial<Record<Locale, string>> = {};
  for (const locale of LOCALES) {
    const escaped = locale.replace(/[-]/g, "\\-");
    const match = markdown.match(new RegExp(`^## ${escaped}\\n+\`\`\`text\\n([\\s\\S]*?)\\n\`\`\``, "m"));
    if (match) result[locale] = match[1]!;
  }
  return result;
}

function validateVariant(variant: PromptVariant, issues: string[], label: string) {
  const ids = new Set<string>();
  for (const parameter of variant.parameters) {
    if (ids.has(parameter.id)) issues.push(`${label}: duplicate parameter ${parameter.id}`);
    ids.add(parameter.id);
    const optionIds = new Set<string>();
    for (const option of parameter.options) {
      if (optionIds.has(option.id)) issues.push(`${label}: duplicate option ${parameter.id}.${option.id}`);
      optionIds.add(option.id);
      for (const locale of LOCALES) {
        if (/\{\{|\}\}/.test(option.replacements[locale])) issues.push(`${label}: ${parameter.id}.${option.id} ${locale} replacement contains a token`);
      }
    }
    if (!optionIds.has(parameter.default)) issues.push(`${label}: ${parameter.id} default "${parameter.default}" is not an option`);
  }

  for (const [locale, template] of Object.entries(variant.templates) as [Locale, string][]) {
    let tokens: string[];
    try {
      tokens = templateTokenIds(parseTemplate(template));
    } catch (error) {
      issues.push(`${label}: template.${locale} ${(error as Error).message}`);
      continue;
    }
    for (const token of tokens) if (!ids.has(token)) issues.push(`${label}: template.${locale} uses undeclared token {{${token}}}`);
    for (const id of ids) if (!tokens.includes(id)) issues.push(`${label}: template.${locale} never uses parameter ${id}`);
  }
}

/** Page copy must label every parameter of every variant, and nothing else. */
function validateParameterLabels(entry: PromptEntry, issues: string[], label: string) {
  const ids = new Set(entry.variants.flatMap((variant) => variant.parameters.map((parameter) => parameter.id)));
  for (const [locale, content] of Object.entries(entry.content) as [Locale, LocaleContent][]) {
    for (const id of ids) if (!content.parameterLabels[id]) issues.push(`${label}: ${locale}.json lacks parameterLabels.${id}`);
    for (const key of Object.keys(content.parameterLabels)) if (!ids.has(key)) issues.push(`${label}: ${locale}.json labels unknown parameter ${key}`);
  }
}

function loadVariant(
  dir: string,
  spec: { id: string; labels: Record<Locale, string> | null; templateVersion: string; templatePaths: Partial<Record<Locale, string>>; parametersPath: string },
  outputLocales: readonly Locale[],
  issues: string[],
  label: string,
): PromptVariant | null {
  const where = spec.id === "default" ? label : `${label} (variant ${spec.id})`;
  const templates: PromptVariant["templates"] = {};
  for (const locale of outputLocales) {
    const file = spec.templatePaths[locale];
    if (!file) {
      issues.push(`${where}: templatePaths.${locale} is missing`);
      continue;
    }
    const text = readText(path.join(dir, file), issues, `${label}/${file}`);
    if (text !== null) templates[locale] = text;
  }
  for (const locale of Object.keys(spec.templatePaths)) {
    if (!outputLocales.includes(locale as Locale)) issues.push(`${where}: templatePaths.${locale} is not an output locale`);
  }
  const parameters = readJson(path.join(dir, spec.parametersPath), parametersSchema, issues, `${label}/${spec.parametersPath}`);
  if (!parameters) return null;
  const variant: PromptVariant = { id: spec.id, labels: spec.labels, templateVersion: spec.templateVersion, templates, parameters: parameters.parameters };
  validateVariant(variant, issues, where);
  return variant;
}

function validateExamples(entry: PromptEntry, dir: string, issues: string[], label: string) {
  const ids = new Set<string>();
  const parameterIds = new Map(entry.parameters.map((parameter) => [parameter.id, parameter]));
  for (const example of entry.examples) {
    const where = `${label}: example ${example.id}`;
    if (ids.has(example.id)) issues.push(`${where} duplicate id`);
    ids.add(example.id);

    const file = path.join(dir, example.src);
    if (!existsSync(file)) {
      issues.push(`${where} image file not found (${example.src})`);
    } else {
      try {
        const size = imageSize(readFileSync(file));
        if (size.width !== example.width || size.height !== example.height) {
          issues.push(`${where} declares ${example.width}x${example.height} but the file is ${size.width}x${size.height}`);
        }
      } catch (error) {
        issues.push(`${where} unreadable image (${(error as Error).message})`);
      }
    }

    if (example.provenance === "project-verified" && !example.recipe) issues.push(`${where} project-verified examples need a complete recipe`);
    if (example.recipe) {
      for (const [id, value] of Object.entries(example.recipe.selections)) {
        const parameter = parameterIds.get(id);
        if (!parameter || !parameter.options.some((option) => option.id === value)) issues.push(`${where} recipe has invalid selection ${id}=${value}`);
      }
      if (Object.keys(example.recipe.selections).length !== entry.parameters.length) issues.push(`${where} recipe must record every parameter`);
    }
  }
}

function loadEntry(dir: string, options: LoadOptions, taxonomy: Taxonomy, issues: string[]): PromptEntry | null {
  const name = path.basename(dir);
  const label = `prompts/${name}`;
  const before = issues.length;
  const meta = readJson(path.join(dir, "meta.json"), metaSchema, issues, `${label}/meta.json`);
  if (!meta) return null;

  if (meta.id !== name || meta.slug !== name) issues.push(`${label}: id and slug must equal the directory name`);
  if (meta.fixture && !options.allowFixtures) issues.push(`${label}: fixture records are not allowed in this content root`);
  if (meta.status === "published" && !meta.publishedAt) issues.push(`${label}: published entries need publishedAt`);
  if (meta.status !== "published" && meta.status !== "archived" && meta.publishedAt) issues.push(`${label}: drafts must not have publishedAt`);
  if (meta.updatedAt < meta.createdAt) issues.push(`${label}: updatedAt precedes createdAt`);
  if (!taxonomy.categories.some((category) => category.id === meta.category)) issues.push(`${label}: unknown category ${meta.category}`);
  for (const tag of meta.tags) if (!taxonomy.tags.some((item) => item.id === tag)) issues.push(`${label}: unknown tag ${tag}`);
  if (new Set(meta.tags).size !== meta.tags.length) issues.push(`${label}: duplicate tags`);
  if (new Set(meta.sources.map((source) => source.id)).size !== meta.sources.length) issues.push(`${label}: duplicate source ids`);
  if (!meta.sources.some((source) => source.role === "original")) issues.push(`${label}: needs one source with role "original"`);

  const content: PromptEntry["content"] = {};
  for (const locale of meta.contentLocales) {
    const data = readJson(path.join(dir, `${locale}.json`), localeContentSchema, issues, `${label}/${locale}.json`);
    if (data) content[locale] = data;
  }
  const specs = meta.variants ?? [{ id: "default", labels: null, templateVersion: meta.templateVersion, templatePaths: meta.templatePaths, parametersPath: meta.parametersPath }];
  if (meta.variants) {
    const [primary] = meta.variants;
    const same = primary && primary.templateVersion === meta.templateVersion && primary.parametersPath === meta.parametersPath && JSON.stringify(primary.templatePaths) === JSON.stringify(meta.templatePaths);
    if (!same) issues.push(`${label}: variants[0] must match the top-level templateVersion, templatePaths and parametersPath`);
    if (new Set(meta.variants.map((variant) => variant.id)).size !== meta.variants.length) issues.push(`${label}: duplicate variant ids`);
  }
  const variants = specs.map((spec) => loadVariant(dir, spec, meta.outputLocales, issues, label));

  const original = readText(path.join(dir, meta.originalPath), issues, `${label}/${meta.originalPath}`);
  const examples = readJson(path.join(dir, meta.examplesPath), examplesSchema, issues, `${label}/${meta.examplesPath}`);
  const attributionFile = path.join(dir, "ATTRIBUTION.md");
  const attribution = existsSync(attributionFile) ? parseAttribution(readFileSync(attributionFile, "utf8")) : {};
  if (!existsSync(attributionFile)) issues.push(`${label}: ATTRIBUTION.md not found`);
  for (const locale of meta.contentLocales) if (!attribution[locale]) issues.push(`${label}: ATTRIBUTION.md lacks a ${locale} block`);

  if (original === null || !examples || variants.some((variant) => !variant)) return null;
  const loaded = variants as PromptVariant[];
  const entry: PromptEntry = {
    meta,
    content,
    original,
    templates: loaded[0]!.templates,
    parameters: loaded[0]!.parameters,
    variants: loaded,
    examples,
    attribution,
    repoPath: path.relative(process.cwd(), dir).split(path.sep).join("/"),
  };
  validateParameterLabels(entry, issues, label);
  validateExamples(entry, dir, issues, label);

  if (meta.status === "published") {
    for (const blocker of publicationBlockers(entry)) issues.push(`${label}: cannot be published — ${blocker}`);
  }
  return issues.length === before ? entry : null;
}

export function loadContentLibrary(options: LoadOptions): ContentLibrary {
  const issues: string[] = [];
  const taxonomy = readJson(path.join(options.root, "taxonomy.json"), taxonomySchema, issues, "taxonomy.json");
  if (!taxonomy) return { taxonomy: { schemaVersion: 1, categories: [], tags: [] }, entries: [], issues };

  for (const [kind, terms] of [["category", taxonomy.categories], ["tag", taxonomy.tags]] as const) {
    if (new Set(terms.map((term) => term.id)).size !== terms.length) issues.push(`taxonomy.json: duplicate ${kind} id`);
  }

  const promptsDir = path.join(options.root, "prompts");
  const dirs = existsSync(promptsDir)
    ? readdirSync(promptsDir, { withFileTypes: true })
        .filter((item) => item.isDirectory())
        .map((item) => path.join(promptsDir, item.name))
        .sort()
    : [];

  const entries: PromptEntry[] = [];
  for (const dir of dirs) {
    const entry = loadEntry(dir, options, taxonomy, issues);
    if (entry) entries.push(entry);
  }

  const claimed = new Map<string, string>();
  for (const entry of entries) claimed.set(entry.meta.slug, entry.meta.slug);
  for (const entry of entries) {
    for (const old of entry.meta.redirectFrom ?? []) {
      if (claimed.has(old)) issues.push(`prompts/${entry.meta.slug}: redirectFrom "${old}" collides with ${claimed.get(old)}`);
      claimed.set(old, entry.meta.slug);
    }
  }
  return { taxonomy, entries, issues };
}
