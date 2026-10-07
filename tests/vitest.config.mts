/**
 * [INPUT]: Vitest, repository paths and the shared fixture builder.
 * [OUTPUT]: Node-based test configuration with content aliases and fixture setup.
 * [POS]: tests unit-suite configuration; also runs the existing content suite in the fast path.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import { defineConfig } from "vitest/config";

const repo = path.resolve(import.meta.dirname, "..");

export default defineConfig({
  root: repo,
  resolve: { alias: { "@": path.join(repo, "src") } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Content-validation cases read the synthetic images, so fixtures are rebuilt once per run.
    globalSetup: ["tests/fixtures/build.ts"],
  },
});
