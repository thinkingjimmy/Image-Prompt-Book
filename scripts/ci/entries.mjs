/**
 * [INPUT]: IPB_CHANGED_PROMPTS JSON from the conservative CI scope step and a completed build.
 * [OUTPUT]: Affected-entry bilingual browser checks with normal prompt-import artifacts.
 * [POS]: scripts/ci safe argv adapter; avoids interpolating Git paths into workflow shell commands.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";

try {
  const slugs = JSON.parse(process.env.IPB_CHANGED_PROMPTS ?? "null");
  assert(Array.isArray(slugs) && slugs.length > 0 && slugs.every((slug) => typeof slug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)), "Expected a nonempty JSON array of prompt slugs");
  const child = spawnSync("pnpm", ["test:prompt", ...new Set(slugs)], { stdio: "inherit" });
  if (child.error) throw child.error;
  process.exitCode = child.status ?? 1;
} catch (error) { console.error(error.message); process.exitCode = 1; }
