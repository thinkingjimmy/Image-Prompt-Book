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
