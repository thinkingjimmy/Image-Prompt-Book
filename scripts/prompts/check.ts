/**
 * [INPUT]: Real content, optional independent source expectations, and Playwright Chromium.
 * [OUTPUT]: test:prompt CLI with optional validation-only source checks, browser artifacts and timings.
 * [POS]: scripts/prompts entry point; shares one verified production server across requested entries.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { chromium } from "@playwright/test";
import { z } from "zod";
import { LOCALES } from "@/i18n/config";
import { loadContentLibrary, publicationBlockers, type PromptEntry } from "@/lib/content/load";
import { composePrompt, defaultSelections, type Selections } from "@/lib/prompt/template";
import { checkEntry, type PromptChecks } from "./browser";
import { startPreviewServer } from "./server";

const localizedPaths = z.object({ en: z.string().optional(), "zh-CN": z.string().optional() }).strict();
const localizedClauses = z.object({ en: z.array(z.string().min(1)).optional(), "zh-CN": z.array(z.string().min(1)).optional() }).strict();
const checksSchema = z.record(z.string(), z.object({
  originalSha256: z.string().regex(/^[a-f0-9]{64}$/).optional(),
  variants: z.record(z.string(), z.object({ defaultPaths: localizedPaths.optional(), requiredText: localizedClauses.optional() }).strict()).optional(),
}).strict());

function* combinations(parameters: PromptEntry["parameters"], index = 0, selections: Selections = {}): Generator<Selections> {
  const parameter = parameters[index];
  if (!parameter) { yield selections; return; }
  for (const option of parameter.options) yield* combinations(parameters, index + 1, { ...selections, [parameter.id]: option.id });
}

function checkSource(entry: PromptEntry, checks: PromptChecks | undefined, checksDir: string) {
  const hash = createHash("sha256").update(entry.original.slice(0, -1)).digest("hex");
  if (checks?.originalSha256) assert.equal(hash, checks.originalSha256, `${entry.meta.slug}: source hash mismatch`);
  for (const id of Object.keys(checks?.variants ?? {})) assert(entry.variants.some((variant) => variant.id === id), `Unknown expected variant: ${id}`);
  for (const variant of entry.variants) {
    const rules = checks?.variants?.[variant.id];
    for (const locale of LOCALES) {
      const defaultPath = rules?.defaultPaths?.[locale];
      if (defaultPath) {
        const independent = readFileSync(path.resolve(checksDir, defaultPath), "utf8");
        assert.equal(composePrompt({ record: variant, selections: defaultSelections(variant.parameters), outputLocale: locale }), independent, `${entry.meta.slug}/${variant.id}/${locale}: default differs from source expectation`);
      }
      const clauses = rules?.requiredText?.[locale];
      if (clauses?.length) {
        for (const selections of combinations(variant.parameters)) {
          const text = composePrompt({ record: variant, selections, outputLocale: locale });
          for (const clause of clauses) assert(text.includes(clause), `${entry.meta.slug}/${variant.id}/${locale}: missing ${clause}`);
        }
      }
    }
  }
  return { originalSha256: hash, sourcePinned: Boolean(checks?.originalSha256), independentDefaults: Boolean(checks?.variants && Object.values(checks.variants).some((variant) => variant.defaultPaths)) };
}

function saveExpectations(artifact: string, checks: Record<string, PromptChecks>, checksDir: string, slugs: string[]): string {
  const dir = path.join(artifact, "inputs");
  mkdirSync(dir, { recursive: true });
  const snapshot: Record<string, PromptChecks> = {};
  for (const slug of slugs) {
    const saved = structuredClone(checks[slug]!);
    for (const [variant, rules] of Object.entries(saved.variants ?? {})) {
      for (const locale of LOCALES) {
        const source = rules.defaultPaths?.[locale];
        if (!source) continue;
        const relative = path.join(slug, variant, `${locale}.txt`);
        const folder = path.dirname(path.join(dir, relative));
        mkdirSync(folder, { recursive: true });
        copyFileSync(path.resolve(checksDir, source), path.join(dir, relative));
        rules.defaultPaths![locale] = relative;
        writeFileSync(path.join(folder, "README.md"), `# ${slug}/${variant} defaults\n\nIndependent default text captured before template substitution.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
        writeFileSync(path.join(dir, slug, "README.md"), `# ${slug} expectations\n\nEach variant folder retains independent defaults. Source hash and required clauses are in ../checks.json.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
      }
    }
    snapshot[slug] = saved;
  }
  const file = path.join(dir, "checks.json");
  writeFileSync(file, `${JSON.stringify(snapshot, null, 2)}\n`);
  writeFileSync(path.join(dir, "README.md"), `# Independent expectations\n\nchecks.json and entry folders retain the source/default expectations used by this run so replay does not depend on scratch files.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
  return file;
}

async function main() {
  const { positionals, values } = parseArgs({ allowPositionals: true, options: { url: { type: "string" }, checks: { type: "string" }, "validate-only": { type: "boolean" } } });
  assert(positionals.length > 0, "Usage: pnpm test:prompt <slug...> [--checks <json>] [--url <local URL>] [--validate-only]");
  assert(positionals.every((slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)), "Use prompt slugs, not paths");
  const slugs = [...new Set(positionals)];
  const library = loadContentLibrary({ root: path.resolve("content"), allowFixtures: false });
  assert.deepEqual(library.issues, [], "Fix content validation before previewing");
  const entries = slugs.map((slug) => {
    const entry = library.entries.find((item) => item.meta.slug === slug);
    assert(entry, `Unknown prompt: ${slug}`);
    assert(entry.meta.status !== "archived", `${slug}: archived entries cannot be previewed`);
    if (!values.url) assert.deepEqual(publicationBlockers(entry), [], `${slug}: use --url with a draft dev server, or prepare local publication first`);
    return entry;
  });
  const checks: Record<string, PromptChecks> = values.checks ? checksSchema.parse(JSON.parse(readFileSync(values.checks, "utf8"))) : {};
  if (values.checks) for (const slug of slugs) assert(checks[slug], `${slug}: missing independent expectations in --checks`);
  if (values["validate-only"]) {
    assert(values.checks, "--validate-only requires independent source/default expectations");
    for (const entry of entries) {
      const rules = checks[entry.meta.slug]!;
      assert(rules.originalSha256, `${entry.meta.slug}: missing independent source hash`);
      for (const variant of entry.variants) for (const locale of LOCALES) {
        assert(rules.variants?.[variant.id]?.defaultPaths?.[locale], `${entry.meta.slug}/${variant.id}/${locale}: missing independent default`);
      }
    }
  }
  const checksDir = values.checks ? path.dirname(path.resolve(values.checks)) : process.cwd();
  const sources = entries.map((entry) => ({ slug: entry.meta.slug, ...checkSource(entry, checks[entry.meta.slug], checksDir) }));
  if (values.url) {
    const url = new URL(values.url);
    assert(["http:", "https:"].includes(url.protocol) && ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname), "--url must be a local preview URL");
  }
  if (values["validate-only"]) { console.log(JSON.stringify({ slugs, sources }, null, 2)); return; }

  const artifact = path.resolve("tests/test-results/prompt-import", new Date().toISOString().replace(/[:.]/g, "-"));
  mkdirSync(artifact, { recursive: true });
  const savedChecks = values.checks ? saveExpectations(artifact, checks, checksDir, slugs) : undefined;
  const started = Date.now();
  const report: { passed: boolean; base?: string; durationMs?: number; sources: typeof sources; entries: Awaited<ReturnType<typeof checkEntry>>[]; failure?: string } = { passed: false, sources, entries: [] };
  let server: Awaited<ReturnType<typeof startPreviewServer>> | undefined;
  let browser: Awaited<ReturnType<typeof chromium.launch>> | undefined;
  const stopOnSignal = () => { void browser?.close(); void server?.stop(); process.exitCode = 130; };
  process.once("SIGINT", stopOnSignal);
  process.once("SIGTERM", stopOnSignal);
  try {
    server = values.url ? undefined : await startPreviewServer(path.join(artifact, "server.log"));
    report.base = values.url?.replace(/\/$/, "") ?? server!.url;
    browser = await chromium.launch();
    for (const entry of entries) report.entries.push(await checkEntry(browser, entry, report.base, path.join(artifact, entry.meta.slug)));
    report.passed = true;
  } catch (error) {
    const describe = (failure: unknown) => failure instanceof Error ? failure.stack : String(failure);
    report.failure = error instanceof AggregateError ? error.errors.map(describe).join("\n\n") : describe(error);
    throw error;
  } finally {
    process.removeListener("SIGINT", stopOnSignal);
    process.removeListener("SIGTERM", stopOnSignal);
    await browser?.close();
    await server?.stop();
    report.durationMs = Date.now() - started;
    writeFileSync(path.join(artifact, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(path.join(artifact, "README.md"), `# Prompt import verification\n\nResult: ${report.passed ? "passed" : "failed"}. report.json contains source pins, entry checks, failures, and timings. Each entry folder contains bilingual screenshots and browser traces. server.log records the temporary production server when this runner owns it. inputs/ retains independent expectations when supplied.\n\nRepeat: pnpm test:prompt ${slugs.join(" ")}${savedChecks ? ` --checks ${savedChecks}` : ""}${values.url ? ` --url ${values.url}` : ""}\n\nChatGPT prefill is checked as a URL only; remote behavior and image generation are not exercised.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
    console.log(`${report.passed ? "Passed" : "Failed"} in ${(report.durationMs / 1000).toFixed(1)}s. Artifacts: ${artifact}`);
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
