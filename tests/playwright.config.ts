/**
 * [INPUT]: Playwright configuration/devices, the isolated fixture build and optional IPB_E2E_BASE_URL loopback origin.
 * [OUTPUT]: Browser projects, fixture server or existing local server checks, and module-scoped E2E output.
 * [POS]: Main E2E entry point; supports focused development-server verification and preserves sibling artifacts.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;
const localServer = process.env.IPB_E2E_BASE_URL ? new URL(process.env.IPB_E2E_BASE_URL) : undefined;
if (localServer && (localServer.protocol !== "http:" || !["localhost", "127.0.0.1", "[::1]"].includes(localServer.hostname) || localServer.username || localServer.password || localServer.pathname !== "/" || localServer.search || localServer.hash)) {
  throw new Error("IPB_E2E_BASE_URL must be an HTTP loopback origin without credentials, a path, query or hash.");
}

export default defineConfig({
  // Paths are relative to this file; the server itself runs from the repository root.
  testDir: "e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : "50%",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  outputDir: "test-results/e2e",
  reporter: process.env.CI ? [["github"], ["html", { open: "never", outputFolder: "playwright-report" }]] : [["list"]],
  use: {
    baseURL: localServer?.origin ?? `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Also exercises the reduced-motion path; layout assertions never race enter animations.
    contextOptions: { reducedMotion: "reduce" },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 860 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile|@smoke/ },
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, grep: /@smoke/ },
    { name: "webkit", use: { ...devices["Desktop Safari"] }, grep: /@smoke/ },
  ],
  webServer: localServer ? undefined : {
    // A production build against isolated fixture content, in its own dist dir so it never replaces a real build.
    cwd: path.resolve(__dirname, ".."),
    command: "pnpm exec tsx tests/fixtures/build.ts && pnpm exec next build && pnpm exec next start --port 3200",
    url: `http://localhost:${PORT}/en`,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI,
    env: {
      IPB_CONTENT_DIR: "tests/fixtures/.generated/content",
      IPB_DIST_DIR: ".next-e2e",
      IPB_DEPLOY_ENV: "production",
      IPB_E2E: "1",
      SITE_URL: "https://imagepromptbook.com",
    },
  },
});
