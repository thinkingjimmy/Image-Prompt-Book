/**
 * [INPUT]: Published prompt-only Git changes and independent source/default expectations.
 * [OUTPUT]: verify:prompt, a guarded content validation/build/bilingual E2E pipeline.
 * [POS]: scripts/ci local fast path; refuses code/shared changes and reuses the entry runner.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";
import { inspectScope } from "./scope.mjs";

async function main() {
  const { values } = parseArgs({ options: { base: { type: "string" }, checks: { type: "string" } } });
  const scope = inspectScope({ base: values.base ?? "origin/main" });
  assert(scope.mode === "content", `${scope.reason}. Run pnpm verify and the relevant E2E module.`);
  assert(values.checks, "Use --checks with independent source/default expectations");
  const checks = path.resolve(values.checks);
  const expected = JSON.parse(readFileSync(checks, "utf8"));
  for (const slug of scope.slugs) assert(expected[slug], `${slug}: missing independent expectations`);
  const artifact = path.resolve("tests/test-results/ci", `content-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  mkdirSync(artifact, { recursive: true });
  const report = { passed: false, scope, steps: [] };
  const run = async (name, args) => {
    const start = performance.now();
    const outcome = await new Promise((resolve) => {
      const child = spawn("pnpm", args, { stdio: "inherit" });
      const interrupt = () => child.kill("SIGINT");
      const terminate = () => child.kill("SIGTERM");
      process.once("SIGINT", interrupt); process.once("SIGTERM", terminate);
      const cleanup = () => { process.removeListener("SIGINT", interrupt); process.removeListener("SIGTERM", terminate); };
      child.once("error", () => { cleanup(); resolve({ exitCode: 127, signal: null }); });
      child.once("exit", (exitCode, signal) => { cleanup(); resolve({ exitCode, signal }); });
    });
    report.steps.push({ name, seconds: Math.round(performance.now() - start) / 1000, ...outcome });
    assert(outcome.exitCode === 0, `${name} failed`);
  };
  try {
    await run("source-expectations", ["test:prompt", ...scope.slugs, "--checks", checks, "--validate-only"]);
    await run("content-combinations", ["exec", "vitest", "run", "-c", "tests/vitest.config.mts", "tests/unit/content.test.ts"]);
    await run("production-build", ["build"]);
    await run("entry-e2e", ["test:prompt", ...scope.slugs, "--checks", checks]);
    report.passed = true;
  } finally {
    writeFileSync(path.join(artifact, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
    writeFileSync(path.join(artifact, "README.md"), `# Content verification\n\nResult: ${report.passed ? "passed" : "failed"}. report.json records the guarded Git scope and command durations. Entry screenshots, independent inputs and replay commands are retained under tests/test-results/prompt-import/.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
    console.log(`Content verification artifacts: ${artifact}`);
  }
}

void main().catch((error) => { console.error(error.message); process.exitCode = 1; });
