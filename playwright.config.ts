/**
 * [INPUT]: 依赖 @playwright/test 的 defineConfig/devices
 * [OUTPUT]: 默认导出 E2E 配置：chromium 全量，mobile/firefox/webkit 跑 @mobile/@smoke，webServer 自动构建 fixture 站点
 * [POS]: 项目根的端到端测试入口，与 tests/e2e 配合
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 3200;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  workers: process.env.CI ? 2 : "50%",
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
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
  webServer: {
    // A production build against isolated fixture content, in its own dist dir so it never replaces a real build.
    command: "pnpm e2e:serve",
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
