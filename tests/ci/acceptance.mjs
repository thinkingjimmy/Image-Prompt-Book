/**
 * [INPUT]: The scope/fast CLIs, isolated Git fixtures and optional real-entry source expectations.
 * [OUTPUT]: Console E2E results and an optional public-checkout build/browser replay artifact.
 * [POS]: tests/ci acceptance entry point; never changes the caller's Git history or prompt data.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

const source = path.resolve(import.meta.dirname, "../..");
const { values } = parseArgs({ options: { pipeline: { type: "boolean" }, checks: { type: "string" } } });
const artifact = path.join(source, "tests/test-results/ci", `acceptance-${new Date().toISOString().replace(/[:.]/g, "-")}`);
const scratch = mkdtempSync(path.join(os.tmpdir(), "ipb-ci-"));
mkdirSync(artifact, { recursive: true });
const report = { passed: false, scratch, cases: [], pipeline: null };
const write = (root, relative, text) => { const file = path.join(root, relative); mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, text); };
const git = (root, ...args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
const saveCommit = (root) => { git(root, "add", "--all"); git(root, "commit", "-qm", "test: save acceptance baseline"); return git(root, "rev-parse", "HEAD"); };
const metadata = (slug) => JSON.stringify({ id: slug, slug, status: "published", publishedAt: "2026-10-07T12:00:00+08:00" });

function repository(name) {
  const root = path.join(scratch, name);
  mkdirSync(root);
  git(root, "init", "-q");
  git(root, "config", "user.name", "Acceptance Test");
  git(root, "config", "user.email", "acceptance@example.invalid");
  write(root, "content/prompts/alpha/meta.json", metadata("alpha"));
  write(root, "content/prompts/alpha/README.md", "# Alpha\n");
  write(root, "src/app.ts", "export const value = 1;\n");
  const base = saveCommit(root);
  return { root, base };
}

function scopeCase(name, mutate, mode, slugs = []) {
  const repo = repository(name);
  mutate(repo.root);
  const result = spawnSync(process.execPath, [path.join(source, "scripts/ci/scope.mjs"), "--root", repo.root, "--base", repo.base], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const actual = JSON.parse(result.stdout);
  assert.equal(actual.mode, mode, name);
  assert.deepEqual(actual.slugs, slugs, name);
  if (mode === "full") {
    const refused = spawnSync(process.execPath, [path.join(source, "scripts/ci/verify.mjs"), "--base", repo.base, "--checks", "missing.json"], { cwd: repo.root, encoding: "utf8" });
    assert.notEqual(refused.status, 0);
    assert(refused.stderr.includes("Run pnpm verify"), name);
    assert(!existsSync(path.join(repo.root, ".next/BUILD_ID")));
  }
  report.cases.push({ name, passed: true, mode: actual.mode, reason: actual.reason });
}

async function main() {
  scopeCase("published-edit", (root) => write(root, "content/prompts/alpha/README.md", "# Updated Alpha\n"), "content", ["alpha"]);
  scopeCase("new-entry", (root) => { write(root, "content/prompts/beta/meta.json", metadata("beta")); write(root, "content/prompts/README.md", "# Prompts\n"); }, "content", ["beta"]);
  scopeCase("multiple-entries", (root) => { write(root, "content/prompts/alpha/en.json", "{}\n"); write(root, "content/prompts/beta/meta.json", metadata("beta")); }, "content", ["alpha", "beta"]);
  scopeCase("staged-content", (root) => { write(root, "content/prompts/alpha/README.md", "# Updated\n"); git(root, "add", "content"); }, "content", ["alpha"]);
  scopeCase("code-and-content", (root) => { write(root, "content/prompts/alpha/en.json", "{}\n"); write(root, "src/app.ts", "export const value = 2;\n"); }, "full");
  scopeCase("untracked-code", (root) => write(root, "new-script.mjs", "export {};\n"), "full");
  scopeCase("staged-code", (root) => { write(root, "src/app.ts", "export {};\n"); git(root, "add", "src"); }, "full");
  scopeCase("unsupported-prompt-file", (root) => write(root, "content/prompts/alpha/run.mjs", "export {};\n"), "full");
  scopeCase("taxonomy", (root) => write(root, "content/taxonomy.json", "{}\n"), "full");
  scopeCase("collection", (root) => write(root, "content/collections/sample/meta.json", "{}\n"), "full");
  scopeCase("dependency", (root) => write(root, "package.json", "{}\n"), "full");
  scopeCase("workflow", (root) => write(root, ".github/workflows/ci.yml", "name: Changed\n"), "full");
  scopeCase("deletion", (root) => git(root, "rm", "content/prompts/alpha/README.md"), "full");
  scopeCase("rename", (root) => git(root, "mv", "content/prompts/alpha/README.md", "content/prompts/alpha/OTHER.md"), "full");
  for (const status of ["draft", "archived"]) scopeCase(status, (root) => write(root, "content/prompts/alpha/meta.json", JSON.stringify({ id: "alpha", slug: "alpha", status })), "full");
  scopeCase("malformed-meta", (root) => write(root, "content/prompts/alpha/meta.json", "not JSON"), "full");
  scopeCase("wrong-slug", (root) => write(root, "content/prompts/alpha/meta.json", metadata("other")), "full");
  scopeCase("fixture", (root) => write(root, "content/prompts/alpha/meta.json", JSON.stringify({ ...JSON.parse(metadata("alpha")), fixture: true })), "full");
  scopeCase("symlink", (root) => symlinkSync(path.join(root, "src/app.ts"), path.join(root, "content/prompts/alpha/en.json")), "full");
  scopeCase("empty-diff", () => {}, "full");
  scopeCase("maps-only", (root) => write(root, "content/ACKNOWLEDGEMENTS.md", "# Credits\n"), "full");
  scopeCase("unverified-code-before-content", (root) => { write(root, "src/app.ts", "export const value = 2;\n"); saveCommit(root); write(root, "content/prompts/alpha/README.md", "# Updated\n"); }, "full");

  const baseline = repository("baseline-errors");
  git(baseline.root, "checkout", "-qb", "other");
  write(baseline.root, "other.txt", "other\n");
  const divergent = saveCommit(baseline.root);
  git(baseline.root, "checkout", "-q", baseline.base);
  for (const [name, base] of [["missing-base", "missing-ref"], ["zero-base", "0".repeat(40)], ["divergent-base", divergent]]) {
    const result = spawnSync(process.execPath, [path.join(source, "scripts/ci/scope.mjs"), "--root", baseline.root, "--base", base], { encoding: "utf8" });
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).mode, "full");
    report.cases.push({ name, passed: true, mode: "full" });
  }
  for (const event of ["workflow_dispatch", "release", "push"]) {
    const result = spawnSync(process.execPath, [path.join(source, "scripts/ci/scope.mjs"), "--ci", "--root", baseline.root], { encoding: "utf8", env: { ...process.env, GITHUB_EVENT_NAME: event, GITHUB_REF: "refs/tags/v1.0.0", GH_TOKEN: "" } });
    assert.equal(result.status, 0);
    assert.equal(JSON.parse(result.stdout).mode, "full");
    report.cases.push({ name: `no-baseline-${event}`, passed: true, mode: "full" });
  }
  if (values.pipeline) {
    assert(values.checks, "Use --checks with captured real-entry expectations for --pipeline");
    const checks = path.resolve(values.checks);
    const slug = Object.keys(JSON.parse(readFileSync(checks, "utf8")))[0];
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug), "Expected a real prompt slug");
    const root = path.join(scratch, "public-checkout");
    git(source, "clone", "--local", "--no-hardlinks", "--no-checkout", "--quiet", source, root);
    git(root, "config", "user.name", "Acceptance Test");
    git(root, "config", "user.email", "acceptance@example.invalid");
    const files = git(source, "ls-files", "--cached", "--others", "--exclude-standard", "-z").split("\0").filter(Boolean);
    for (const file of files) {
      if (file.startsWith("docs/") || !existsSync(path.join(source, file))) continue;
      const target = path.join(root, file);
      mkdirSync(path.dirname(target), { recursive: true });
      cpSync(path.join(source, file), target);
    }
    saveCommit(root);
    assert(!existsSync(path.join(root, "docs")), "Public checkout must exclude private docs");
    const timed = (name, executable, args) => {
      const start = performance.now();
      const result = spawnSync(executable, args, { cwd: root, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
      writeFileSync(path.join(artifact, `${name}.log`), `${result.stdout ?? ""}${result.stderr ?? ""}`);
      assert.equal(result.status, 0, `${name}: ${result.stderr}`);
      return Math.round(performance.now() - start) / 1000;
    };
    const installSeconds = timed("install", "pnpm", ["install", "--offline", "--frozen-lockfile"]);
    write(root, `content/prompts/${slug}/README.md`, `${readFileSync(path.join(root, `content/prompts/${slug}/README.md`), "utf8")}\nFull source image compositions are retained.\n`);
    const refusals = [
      { name: "missing-expectations", args: ["--base", "HEAD"] },
      { name: "wrong-source-hash", args: ["--base", "HEAD", "--checks", path.join(root, "bad-checks.json")] },
    ];
    const broken = JSON.parse(readFileSync(checks, "utf8"));
    broken[slug].originalSha256 = "0".repeat(64);
    // Keep invalid expectations outside Git so the test reaches the source gate.
    const badChecks = path.join(scratch, "bad-checks.json");
    writeFileSync(badChecks, JSON.stringify(broken));
    refusals[1].args[3] = badChecks;
    for (const refusal of refusals) {
      const result = spawnSync("pnpm", ["verify:prompt", ...refusal.args], { cwd: root, encoding: "utf8" });
      assert.notEqual(result.status, 0);
      assert(!existsSync(path.join(root, ".next/BUILD_ID")), "Refusal must precede build");
      report.cases.push({ name: refusal.name, passed: true, exitCode: result.status });
    }
    const seconds = timed("content-pipeline", "pnpm", ["verify:prompt", "--base", "HEAD", "--checks", checks]);
    cpSync(path.join(root, "tests/test-results"), path.join(artifact, "pipeline"), { recursive: true });
    report.pipeline = { passed: true, root, slug, installSeconds, seconds, privateDocsAbsent: true };
  }
  report.passed = true;
}

try {
  await main();
} catch (error) {
  report.failure = error.stack;
  process.exitCode = 1;
} finally {
  writeFileSync(path.join(artifact, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(path.join(artifact, "README.md"), `# CI routing acceptance\n\nResult: ${report.passed ? "passed" : "failed"}. report.json retains console cases, the temporary checkout and real-pipeline timing. pipeline/ contains independent defaults, browser screenshots/traces and replay records when --pipeline was used. Logs retain command output.\n\nRepeat: pnpm test:ci${values.pipeline ? " --pipeline --checks <captured-checks.json>" : ""}\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
  console.log(`CI acceptance: ${report.passed ? "passed" : "failed"}; ${report.cases.length} cases. Artifacts: ${artifact}`);
  if (report.failure) console.error(report.failure);
}
