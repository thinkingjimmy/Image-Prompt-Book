/**
 * [INPUT]: 依赖 @axe-core/playwright 的 AxeBuilder，依赖 ./helpers 的 test/expect/SLUG
 * [OUTPUT]: 无障碍与布局 E2E：axe WCAG A/AA 扫描（首页、详情、弹窗、说明页）、1–5 列断点、375/768 无横向溢出、超长查询截断；移动端无横向滚动、全屏弹窗与可达操作栏（AC-17/AC-21，IPB-016/080/081/082）
 * [POS]: tests/e2e 的质量底线套件；断点矩阵只在桌面 Chromium 跑，移动端用例只在 mobile 项目跑
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, SLUG, test } from "./helpers";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("axe", () => {
  for (const url of ["/en", "/zh-CN", `/en/prompts/${SLUG}`, `/zh-CN/prompts/${SLUG}`, "/en/licenses", "/en?q=nothing-matches"]) {
    test(`${url} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(url);
      const { violations } = await new AxeBuilder({ page }).withTags(WCAG).analyze();
      expect(violations.map((item) => `${item.id}: ${item.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
    });
  }

  test("the open modal and an open select have no violations", async ({ page }) => {
    await page.goto("/en");
    await page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    let result = await new AxeBuilder({ page }).withTags(WCAG).include('[role="dialog"]').analyze();
    expect(result.violations.map((item) => item.id)).toEqual([]);

    await page.getByRole("dialog").locator('[data-parameter="background"]').click();
    await expect(page.getByRole("listbox")).toBeVisible();
    result = await new AxeBuilder({ page }).withTags(WCAG).include('[role="listbox"]').analyze();
    expect(result.violations.map((item) => item.id)).toEqual([]);
  });
});

test.describe("responsive gallery", () => {
  test.skip(({ isMobile, browserName }) => isMobile || browserName !== "chromium", "desktop Chromium drives the viewport matrix");

  const matrix: [number, number][] = [
    [375, 1],
    [600, 2],
    [800, 3],
    [1200, 4],
    [1500, 5],
  ];
  for (const [width, columns] of matrix) {
    test(`${width}px shows ${columns} column(s) without horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en");
      const count = await page.locator("ul.masonry").evaluate((node) => getComputedStyle(node).columnCount);
      expect(Number(count)).toBe(columns);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
      // Images reserve their space before loading.
      const ratio = await page.locator("ul.masonry img").first().evaluate((node) => getComputedStyle(node).aspectRatio);
      expect(ratio).toMatch(/\d/);
    });
  }

  for (const width of [375, 768]) {
    test(`${width}px detail page has no horizontal scroll`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/zh-CN/prompts/${SLUG}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
    });
  }
});

test("overlong queries are truncated to 100 characters in the canonical URL", async ({ page }) => {
  await page.goto(`/en?q=${"a".repeat(150)}&tags=${Array.from({ length: 8 }, (_, index) => `t${index}`).join(",")}`);
  const q = new URL(page.url()).searchParams.get("q");
  expect(q).toHaveLength(100);
  expect(new URL(page.url()).searchParams.has("tags")).toBe(false);
});

test.describe("mobile", () => {
  test.skip(({ isMobile }) => !isMobile, "mobile viewport only");

  test("pages never scroll horizontally @mobile", async ({ page }) => {
    for (const url of ["/en", "/zh-CN", `/en/prompts/${SLUG}`, `/zh-CN/prompts/${SLUG}`, "/en/licenses"]) {
      await page.goto(url);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, url).toBeLessThanOrEqual(0);
    }
  });

  test("the modal is full screen with a reachable action bar @mobile", async ({ page }) => {
    await page.goto("/en");
    await page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    const viewport = page.viewportSize()!;
    const box = (await dialog.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(viewport.width - 1);
    expect(box.height).toBeGreaterThanOrEqual(viewport.height - 1);

    const copy = dialog.getByRole("button", { name: "Copy prompt" });
    await expect(copy).toBeInViewport();
    await expect(dialog.getByRole("button", { name: "Close" })).toBeInViewport();

    // Content below the sticky bar is never permanently covered by it.
    const improve = dialog.getByRole("link", { name: "CC BY-NC 4.0" });
    await improve.scrollIntoViewIfNeeded();
    await expect(improve).toBeInViewport();
    const hit = await improve.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return node.contains(top);
    });
    expect(hit).toBe(true);
  });
});
