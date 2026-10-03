/**
 * [INPUT]: Playwright, fixture E2E configuration and local real-content production build.
 * [OUTPUT]: Focused analytics E2E projects with JSON, screenshots and retained traces.
 * [POS]: Analytics verification entry point; isolates all Google traffic inside browser routes.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";
import fixture from "./playwright.config";

const fixtureServer = Array.isArray(fixture.webServer) ? fixture.webServer[0]! : fixture.webServer!;

export default defineConfig({
  ...fixture,
  testDir: "analytics",
  workers: 2,
  outputDir: "test-results/analytics/artifacts",
  reporter: [["list"], ["json", { outputFile: "test-results/analytics/report.json" }]],
  use: { ...fixture.use, trace: "on" },
  projects: [
    { name: "fixture-desktop", testMatch: "fixture.spec.ts", use: { ...devices["Desktop Chrome"] } },
    { name: "fixture-mobile", testMatch: "fixture.spec.ts", use: { ...devices["Pixel 7"] } },
    { name: "production-desktop", testMatch: "production.spec.ts", use: { ...devices["Desktop Chrome"], baseURL: "https://imagepromptbook.com" } },
    { name: "production-mobile", testMatch: "production.spec.ts", use: { ...devices["Pixel 7"], baseURL: "https://imagepromptbook.com" } },
  ],
  webServer: [
    { ...fixtureServer, reuseExistingServer: false },
    {
      cwd: path.resolve(__dirname, ".."),
      command: "pnpm exec next build && pnpm exec next start --hostname 127.0.0.1 --port 3201",
      url: "http://127.0.0.1:3201/en",
      timeout: 240_000,
      reuseExistingServer: false,
      env: { IPB_DIST_DIR: ".next", IPB_CONTENT_DIR: "", IPB_E2E: "0", IPB_DEPLOY_ENV: "production", SITE_URL: "https://imagepromptbook.com", VERCEL_ENV: "production" },
    },
  ],
});
