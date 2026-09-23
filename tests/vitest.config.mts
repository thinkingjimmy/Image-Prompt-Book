import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(import.meta.dirname, "src") } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    // Content-validation cases read the synthetic images, so fixtures are rebuilt once per run.
    globalSetup: ["tests/fixtures/build.ts"],
  },
});
