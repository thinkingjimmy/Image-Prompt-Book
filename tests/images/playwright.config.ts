/**
 * [INPUT]: Playwright devices and an existing verified real-content Next.js build.
 * [OUTPUT]: Focused desktop/mobile image-delivery E2E with retained JSON, screenshots and traces.
 * [POS]: Image verification entry point; reuses .next and keeps fixture builds separate.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: "delivery.spec.ts",
  workers: 2,
  retries: 0,
  outputDir: "../test-results/images/artifacts",
  reporter: [["list"], ["json", { outputFile: path.resolve(__dirname, "../test-results/images/report.json") }]],
  use: { baseURL: "http://127.0.0.1:3202", trace: "on", reducedMotion: "reduce" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    cwd: path.resolve(__dirname, "../.."),
    command: "pnpm exec next start --hostname 127.0.0.1 --port 3202",
    url: "http://127.0.0.1:3202/en",
    reuseExistingServer: false,
    env: { IPB_CONTENT_DIR: "", IPB_E2E: "1", IPB_DEPLOY_ENV: "production", SITE_URL: "https://imagepromptbook.com" },
  },
});
