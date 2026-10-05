/**
 * [INPUT]: A reviewed manifest, captured originals/defaults, local images, content schemas and public content acknowledgements.
 * [OUTPUT]: A draft entry, measured examples, directory maps, credit, and independent checks.
 * [POS]: scripts/prompts deterministic import writer; editorial decisions stay in the manifest.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { imageSize } from "image-size";
import { z } from "zod";
import { LOCALES } from "@/i18n/config";
import { examplesSchema, localeContentSchema, metaSchema, parametersSchema, taxonomySchema } from "@/lib/content/schema";
import { parseTemplate, templateTokenIds } from "@/lib/prompt/template";

const localized = <T extends z.ZodType>(value: T) => z.strictObject({ en: value, "zh-CN": value });
const text = z.string().min(1);
const imageSchema = z.strictObject({ file: text, name: z.string().regex(/^[A-Za-z0-9_-]+\.(?:jpg|jpeg|png|webp|avif)$/), alt: localized(text) });
const manifestSchema = z.strictObject({
  meta: metaSchema.pick({ slug: true, category: true, tags: true, originalLocale: true, requiresReferenceImage: true, sourceRecommendedTools: true, sources: true, rights: true }),
  original: z.strictObject({ file: text, sha256: z.string().regex(/^[a-f0-9]{64}$/) }),
  content: localized(localeContentSchema),
  variants: z.array(z.strictObject({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), labels: localized(text).optional(), defaults: localized(text),
    parameters: parametersSchema.shape.parameters,
    occurrences: z.record(z.string(), localized(z.number().int().positive())).optional(),
    requiredText: localized(z.array(text)),
  })).min(1),
  examples: z.array(z.strictObject({
    id: text, image: imageSchema, input: imageSchema.optional(), sourceUrl: text,
    rights: z.strictObject({ basis: text, evidence: text }),
  })).min(1),
  attribution: localized(text),
  audit: z.string().optional(),
});

const protocol = "[PROTOCOL]: Update this header when making changes, then check README.md.";
const json = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;
const map = (title: string, parent: string, members: string[]) => `# ${title}/\n\n> L2 | Parent: [${parent}](${parent})\n\nMembers\n\n${members.join("\n")}\n\n${protocol}\n`;

function main() {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: { "dry-run": { type: "boolean" } } });
  assert(positionals.length === 1, "Usage: pnpm prompt:prepare <manifest.json> [--dry-run]");
  const file = path.resolve(positionals[0]!);
  const scratch = realpathSync(path.dirname(file));
  const sourcePath = (relative: string) => {
    assert(!path.isAbsolute(relative), "Manifest inputs must be relative to the capture folder");
    const resolved = realpathSync(path.resolve(scratch, relative));
    assert(resolved.startsWith(`${scratch}${path.sep}`), "Input escapes the capture folder");
    return resolved;
  };
  const manifest = manifestSchema.parse(JSON.parse(readFileSync(file, "utf8")));
  const { slug } = manifest.meta;
  const entry = path.resolve("content/prompts", slug);
  assert(!existsSync(entry), `${slug}: entry already exists; refusing to overwrite`);
  const taxonomy = taxonomySchema.parse(JSON.parse(readFileSync("content/taxonomy.json", "utf8")));
  assert(taxonomy.categories.some((item) => item.id === manifest.meta.category), "Unknown category");
  for (const tag of manifest.meta.tags) assert(taxonomy.tags.some((item) => item.id === tag), `Unknown tag: ${tag}`);
  const raw = readFileSync(sourcePath(manifest.original.file), "utf8");
  assert(!raw.includes("\r") && !raw.endsWith("\n\n"), "Capture must use LF and at most one final newline");
  const original = raw.endsWith("\n") ? raw.slice(0, -1) : raw;
  assert.equal(createHash("sha256").update(original).digest("hex"), manifest.original.sha256, "Source hash mismatch");
  assert(original.length > 0, "Original is empty");
  assert.equal(new Set(manifest.variants.map((variant) => variant.id)).size, manifest.variants.length, "Duplicate variants");
  assert(manifest.variants.length > 1 || manifest.variants[0]!.id === "default", "A single variant must use ID default");

  const files = new Map<string, string | Buffer>();
  const checks: Record<string, unknown> = {};
  const expectations = new Map<string, string>();
  const variantMeta = manifest.variants.map((variant, index) => {
    assert(manifest.variants.length === 1 || variant.labels, "Multiple variants need bilingual labels");
    const folder = index === 0 ? "templates" : variant.id;
    assert(index === 0 || !["templates", "images"].includes(folder), "Reserved variant folder");
    assert.equal(new Set(variant.parameters.map((parameter) => parameter.id)).size, variant.parameters.length, "Duplicate parameters");
    for (const parameter of variant.parameters) {
      assert(parameter.options.length <= 6, `${parameter.id}: use at most six source-supported choices`);
      assert.equal(new Set(parameter.options.map((option) => option.id)).size, parameter.options.length, "Duplicate options");
      assert(parameter.options.some((option) => option.id === parameter.default), "Missing default option");
    }
    for (const locale of LOCALES) {
      const independent = readFileSync(sourcePath(variant.defaults[locale]), "utf8");
      assert(independent.endsWith("\n") && !independent.endsWith("\n\n") && !independent.includes("\r"), "Defaults need LF and one final newline");
      expectations.set(`${variant.id}/${locale}.txt`, independent);
      let template = independent;
      for (const parameter of variant.parameters) {
        assert(manifest.content[locale].parameterLabels[parameter.id], `${locale}: missing parameter label`);
        const anchor = parameter.options.find((option) => option.id === parameter.default)!.replacements[locale];
        assert.equal(template.split(anchor).length - 1, variant.occurrences?.[parameter.id]?.[locale] ?? 1, `${locale}/${parameter.id}: ambiguous or missing anchor`);
        template = template.split(anchor).join(`{{${parameter.id}}}`);
      }
      assert.deepEqual([...templateTokenIds(parseTemplate(template))].sort(), variant.parameters.map((parameter) => parameter.id).sort(), "Undeclared template tokens");
      files.set(`${folder}/template.${locale}.txt`, template);
    }
    checks[variant.id] = { defaultPaths: Object.fromEntries(LOCALES.map((locale) => [locale, `${variant.id}/${locale}.txt`])), requiredText: variant.requiredText };
    files.set(`${folder}/parameters.json`, json({ schemaVersion: 1, parameters: variant.parameters }));
    files.set(`${folder}/README.md`, map(folder, "../README.md", ["template.en.txt: Complete English prompt with reviewed options.", "template.zh-CN.txt: Complete Chinese prompt with reviewed options.", "parameters.json: Source-supported bilingual choices; defaults reproduce captured wording."]));
    return { id: variant.id, labels: variant.labels!, templateVersion: "1.0.0", templatePaths: { en: `${folder}/template.en.txt`, "zh-CN": `${folder}/template.zh-CN.txt` }, parametersPath: `${folder}/parameters.json` };
  });

  const imageMembers: string[] = [];
  const measure = (image: z.infer<typeof imageSchema>) => {
    const bytes = readFileSync(sourcePath(image.file));
    const size = imageSize(bytes);
    assert(size.width && size.height, "Image has no dimensions");
    const destination = `images/${image.name}`;
    const existing = files.get(destination);
    assert(!existing || Buffer.isBuffer(existing) && existing.equals(bytes), `Conflicting image name: ${image.name}`);
    if (!existing) imageMembers.push(`${image.name}: Local source example, ${size.width} × ${size.height}.`);
    files.set(destination, bytes);
    return { src: destination, width: size.width, height: size.height, alt: image.alt };
  };
  const examples = examplesSchema.parse(manifest.examples.map((example) => ({
    id: example.id, ...measure(example.image), ...(example.input ? { input: measure(example.input) } : {}),
    sourceUrl: example.sourceUrl, provenance: "source-reported", rights: example.rights, recipe: null,
  })));
  assert(new Set(examples.map((example) => example.id)).size === examples.length, "Duplicate examples");
  assert(imageMembers.length <= 7, "Split the import: images folder exceeds eight files with its map");
  const date = manifest.meta.sources[0]!.checkedAt;
  const meta = metaSchema.parse({
    schemaVersion: 1, ...manifest.meta, id: slug, templateVersion: "1.0.0", status: "draft", createdAt: date, updatedAt: date, publishedAt: null,
    contentLocales: LOCALES, outputLocales: LOCALES, originalPath: `original.${manifest.meta.originalLocale}.txt`,
    templatePaths: variantMeta[0]!.templatePaths, parametersPath: variantMeta[0]!.parametersPath, examplesPath: "examples.json", verifiedModels: [],
    ...(variantMeta.length > 1 ? { variants: variantMeta } : {}),
  });
  files.set("meta.json", json(meta));
  files.set(meta.originalPath, `${original}\n`);
  for (const locale of LOCALES) files.set(`${locale}.json`, json(manifest.content[locale]));
  files.set("examples.json", json(examples));
  const attribution = LOCALES.map((locale) => `## ${locale}\n\n\`\`\`text\n${manifest.attribution[locale].trim()}\n\`\`\``).join("\n\n");
  assert(!LOCALES.some((locale) => manifest.attribution[locale].includes("```")), "Attribution must be plain text");
  files.set("ATTRIBUTION.md", `# Attribution — ${slug}\n\n${attribution}\n\nSource SHA-256 without final newline: \`${manifest.original.sha256}\`.\n\n${manifest.audit ?? ""}\n\n${protocol}\n`);
  files.set("images/README.md", map("images", "../README.md", imageMembers));
  files.set("README.md", map(slug, "../README.md", ["meta.json: Identity, publication state, source credit, and rights.", `${meta.originalPath}: Verbatim captured source.`, "en.json: Complete English page copy and labels.", "zh-CN.json: Complete Chinese page copy and labels.", "examples.json: Measured local examples and provenance.", "ATTRIBUTION.md: Bilingual credit, changes, and source hash.", ...variantMeta.map((variant) => `${path.dirname(variant.parametersPath)}/: Full bilingual templates and options.`), "images/: Local example assets and dimension map."]));
  const parentMap = "content/prompts/README.md";
  let parent = readFileSync(parentMap, "utf8");
  const row = `${slug}/: ${manifest.content.en.title}; ${meta.category} entry with complete bilingual prompts, reviewed options, attribution, and local examples.\n`;
  assert(!parent.includes(`${slug}/:`), "Prompt map already contains this slug");
  const rows = [...parent.matchAll(/^([a-z0-9-]+)\/:.*\n/gm)];
  assert(rows.length > 0, "Prompt map has no entry section");
  const next = rows.find((match) => match[1]! > slug);
  const offset = next?.index ?? rows.at(-1)!.index! + rows.at(-1)![0].length;
  parent = `${parent.slice(0, offset)}${row}${parent.slice(offset)}`;
  const ackPath = "content/ACKNOWLEDGEMENTS.md";
  const ack = readFileSync(ackPath, "utf8");
  const source = meta.sources.find((item) => item.role === "original")!;
  assert(source, "An original source is required");
  const author = source.author;
  const credit = author ? `${author.name}${author.url ? ` ([${author.handle ?? author.name}](${author.url}))` : ""}` : "Unknown / 未知";
  const license = meta.rights.promptLicense === "LicenseRef-Unspecified" ? "No license stated / 未声明许可" : meta.rights.promptLicense;
  const ackRow = `| ${manifest.content.en.title}<br>${manifest.content["zh-CN"].title} | ${credit} | [${source.title}](${source.url}) | [${license}](${meta.rights.licenseUrl}) |\n`;
  const closing = "\nThe English and Chinese versions";
  assert(ack.includes(closing), "Acknowledgements closing section is missing");
  const checksDir = path.join(scratch, `${slug}-checks`);
  assert(!existsSync(checksDir), "Independent expectation output already exists");
  console.log(json({ slug, dryRun: Boolean(values["dry-run"]), files: files.size, examples: examples.length, variants: variantMeta.length, originalSha256: manifest.original.sha256, checks: path.join(checksDir, "checks.json") }).trim());
  if (values["dry-run"]) return;
  // Freeze independent defaults before writing any parameterized templates.
  for (const [relative, value] of expectations) { const target = path.join(checksDir, relative); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, value); }
  writeFileSync(path.join(checksDir, "checks.json"), json({ [slug]: { originalSha256: manifest.original.sha256, variants: checks } }));
  for (const variant of manifest.variants) writeFileSync(path.join(checksDir, variant.id, "README.md"), map(variant.id, "../README.md", ["en.txt: Independent English default captured before substitution.", "zh-CN.txt: Independent Chinese default captured before substitution."]));
  writeFileSync(path.join(checksDir, "README.md"), map("expectations", "../README.md", ["checks.json: Original hash, independent defaults, and essential clauses.", ...manifest.variants.map((variant) => `${variant.id}/: Captured bilingual defaults.`)]));
  for (const [relative, value] of files) { const target = path.join(entry, relative); mkdirSync(path.dirname(target), { recursive: true }); writeFileSync(target, value); }
  writeFileSync(parentMap, parent);
  writeFileSync(ackPath, ack.replace(closing, `${ackRow}${closing}`));
}

try { main(); } catch (error) { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; }
