/**
 * [INPUT]: Complete Git changes, published prompt metadata and successful GitHub CI runs.
 * [OUTPUT]: inspectScope(), plus JSON/GitHub outputs selecting content or full verification.
 * [POS]: scripts/ci conservative router shared by local verification and the CI workflow.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { execFileSync } from "node:child_process";
import { appendFileSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const maps = new Set(["content/prompts/README.md", "content/ACKNOWLEDGEMENTS.md"]);
const dataPath = /^(?:meta\.json|examples\.json|en\.json|zh-CN\.json|ATTRIBUTION\.md|README\.md|original\.[A-Za-z0-9-]+\.txt|(?:[a-z0-9-]+\/)?(?:template\.(?:en|zh-CN)\.txt|parameters\.json|README\.md)|images\/[A-Za-z0-9_-][A-Za-z0-9._-]*\.(?:jpg|jpeg|png|webp|avif))$/;
const git = (root, args) => execFileSync("git", args, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 16 * 1024 * 1024 }).trimEnd();
const commit = (root, ref) => {
  if (!ref || ref.startsWith("-") || /^0+$/.test(ref)) throw new Error("Missing base commit");
  return git(root, ["rev-parse", "--verify", `${ref}^{commit}`]);
};
const ancestor = (root, base, head) => {
  try { git(root, ["merge-base", "--is-ancestor", base, head]); return true; } catch { return false; }
};

export function inspectScope({ root = process.cwd(), base = "origin/main", head } = {}) {
  let resolvedBase = null;
  let resolvedHead = null;
  let changes = [];
  const full = (reason) => ({ mode: "full", reason, base: resolvedBase, head: resolvedHead, slugs: [], changes });
  try {
    root = realpathSync(root);
    resolvedBase = commit(root, base);
    resolvedHead = commit(root, head ?? "HEAD");
    if (!ancestor(root, resolvedBase, resolvedHead)) return full("Base is not an ancestor of HEAD");
    const fields = git(root, ["diff", "--no-renames", "--name-status", "-z", resolvedBase, ...(head ? [resolvedHead] : []), "--"]).split("\0").filter(Boolean);
    if (fields.length % 2) return full("Git change records are incomplete");
    for (let index = 0; index < fields.length; index += 2) changes.push({ status: fields[index], path: fields[index + 1] });
    if (!head) {
      const untracked = git(root, ["ls-files", "--others", "--exclude-standard", "-z"]).split("\0").filter(Boolean);
      changes.push(...untracked.map((file) => ({ status: "A", path: file })));
    }
    changes = [...new Map(changes.map((change) => [change.path, change])).values()];
    if (!changes.length) return full("No prompt changes to verify");
    const slugs = new Set();
    for (const change of changes) {
      if (!["A", "M"].includes(change.status)) return full("Deleted, renamed or type-changed files require full verification");
      const target = path.resolve(root, change.path);
      if (lstatSync(target).isSymbolicLink() || !realpathSync(target).startsWith(`${root}${path.sep}`)) return full("Symlinked paths require full verification");
      if (maps.has(change.path)) continue;
      const match = /^content\/prompts\/([^/]+)\/(.+)$/.exec(change.path);
      if (!match || !slugPattern.test(match[1]) || !dataPath.test(match[2])) return full("Changes include code, shared data or unsupported files");
      slugs.add(match[1]);
    }
    if (!slugs.size) return full("Only maps or credits changed; no affected prompt entries");
    for (const slug of slugs) {
      const metaPath = path.join(root, "content/prompts", slug, "meta.json");
      if (lstatSync(metaPath).isSymbolicLink() || !realpathSync(metaPath).startsWith(`${root}${path.sep}`)) return full("Prompt metadata is a symlink");
      const meta = JSON.parse(readFileSync(metaPath, "utf8"));
      if (meta.id !== slug || meta.slug !== slug || meta.status !== "published" || !meta.publishedAt || meta.fixture) return full("Changed prompts must be published, named correctly and non-fixture");
    }
    return { mode: "content", reason: "Only published prompt data and its maps or credits changed", base: resolvedBase, head: resolvedHead, slugs: [...slugs].sort(), changes };
  } catch {
    return full("History or prompt metadata is unavailable or malformed");
  }
}

async function successfulBase(root) {
  if (!["push", "pull_request"].includes(process.env.GITHUB_EVENT_NAME)) return null;
  if (process.env.GITHUB_EVENT_NAME === "push" && process.env.GITHUB_REF !== "refs/heads/main") return null;
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GH_TOKEN;
  if (!repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository) || !token) return null;
  const url = `https://api.github.com/repos/${repository}/actions/workflows/ci.yml/runs?branch=main&status=success&event=push&per_page=20`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000), headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2026-03-10" } });
  if (!response.ok) return null;
  const data = await response.json();
  if (!Array.isArray(data.workflow_runs)) return null;
  const head = commit(root, "HEAD");
  for (const run of data.workflow_runs) {
    if (run.conclusion !== "success" || run.status !== "completed" || run.event !== "push" || run.head_branch !== "main" || !/^[a-f0-9]{40}$/.test(run.head_sha)) continue;
    if (ancestor(root, run.head_sha, head)) return run.head_sha;
  }
  return null;
}

async function main() {
  const { values } = parseArgs({ options: { root: { type: "string" }, base: { type: "string" }, head: { type: "string" }, ci: { type: "boolean" }, out: { type: "string" }, "github-output": { type: "boolean" } } });
  const root = path.resolve(values.root ?? ".");
  let scope;
  if (values.ci) {
    let base = null;
    try { base = await successfulBase(root); } catch { /* Lookup failures select full verification. */ }
    scope = base ? inspectScope({ root, base, head: "HEAD" }) : { mode: "full", reason: "No usable successful ancestor CI baseline; manual and release runs require full verification", base: null, head: null, slugs: [], changes: [] };
  } else {
    scope = inspectScope({ root, base: values.base ?? "origin/main", head: values.head });
  }
  const json = `${JSON.stringify(scope, null, 2)}\n`;
  if (values.out) { const file = path.resolve(values.out); mkdirSync(path.dirname(file), { recursive: true }); writeFileSync(file, json); }
  if (values["github-output"]) {
    if (!process.env.GITHUB_OUTPUT) throw new Error("GITHUB_OUTPUT is unavailable");
    appendFileSync(process.env.GITHUB_OUTPUT, `mode=${scope.mode}\nslugs=${JSON.stringify(scope.slugs)}\n`);
  }
  console.log(json.trim());
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main().catch((error) => { console.error(error.message); process.exitCode = 1; });
}
