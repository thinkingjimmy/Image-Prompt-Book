/**
 * [INPUT]: Axe accessibility analysis and shared hydrated browser fixtures.
 * [OUTPUT]: WCAG A/AA checks, two-to-five gallery columns beside the sidebar, overflow/query limits and mobile prompt dialogs.
 * [POS]: Layout acceptance; desktop Chromium drives the width matrix and the mobile project covers touch viewports.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import AxeBuilder from "@axe-core/playwright";
import { expect, filterMenu, searchField, SLUG, test } from "./helpers";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("Canvas search preserves its draft and uses keyboard-only focus @smoke", async ({ page }, info) => {
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Search prompts", exact: true });
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await trigger.click();
  const field = await searchField(page);
  await expect(field).toBeFocused();
  await expect(field).toHaveCSS("font-size", "16px");
  await expect(field).toHaveCSS("outline-style", "none");
  await field.fill("watercolor");
  await field.press("Escape");
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("searchbox")).toHaveCount(0);
  await trigger.press("Enter");
  await expect(field).toHaveValue("watercolor");
  await expect(field).toHaveCSS("outline-style", "solid");
  await field.press("Enter");
  await expect(page).toHaveURL(/q=watercolor/);
  await page.getByRole("button", { name: "Close search" }).click();
  await expect(trigger).toBeFocused();
  const screenshot = info.outputPath("canvas-search.png");
  await page.screenshot({ path: screenshot });
  await info.attach("canvas-search", { path: screenshot, contentType: "image/png" });
});

test("Canvas filters use a borderless keyboard-accessible dropdown @smoke", async ({ page }, info) => {
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Filters", exact: true });
  await expect(trigger).toHaveCSS("border-top-width", "0px");
  const menu = await filterMenu(page);
  const option = menu.getByRole("menuitemcheckbox", { name: "Filter by tag Watercolor" });
  await option.hover();
  await expect(option).toHaveCSS("outline-style", "none");
  await expect(menu.locator('[class*="scrollbar-width:none"]')).toHaveCount(1);
  const { violations } = await new AxeBuilder({ page }).include('[role="menu"]').withTags(WCAG).analyze();
  expect(violations.map((item) => item.id)).toEqual([]);
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
  await trigger.press("ArrowDown");
  await page.keyboard.press("w");
  await expect(option).toBeFocused();
  await expect(option).toHaveCSS("outline-style", "solid");
  await page.screenshot({ path: info.outputPath("canvas-filter-menu.png") });
  await option.press("Enter");
  await expect(page).toHaveURL(/tags=watercolor/);
  await expect(page.getByRole("button", { name: "Filters, 1 tag selected" })).toBeVisible();
});

test("Canvas keeps its surface anchored, aligns sort labels and has a compact Line footer", async ({ page, isMobile }, info) => {
  test.skip(isMobile, "desktop surface geometry");
  await page.goto("/zh-CN");
  const sort = page.getByRole("navigation", { name: "排序" }).getByRole("link", { name: "精选" });
  const label = sort.locator("span");
  const titleX = (await page.getByRole("banner").getByText("探索", { exact: true }).boundingBox())!.x;
  expect((await label.boundingBox())!.x).toBe(titleX);
  const underline = await label.evaluate((node) => ({ width: parseFloat(getComputedStyle(node, "::after").width), text: node.getBoundingClientRect().width }));
  expect(Math.abs(underline.width - underline.text)).toBeLessThan(1);
  await expect(page.locator("ul.masonry > li").first().locator('a[aria-hidden="true"]').first()).toHaveCSS("border-top-left-radius", "12px");
  await page.mouse.wheel(0, 700);
  await expect.poll(async () => (await page.getByRole("banner").boundingBox())!.y).toBe(16);
  const surface = await page.evaluate(() => {
    const style = getComputedStyle(document.body, "::before");
    return { position: style.position, left: style.left, right: style.right, top: style.top, radius: style.borderTopLeftRadius };
  });
  expect(surface).toEqual({ position: "fixed", left: "240px", right: "0px", top: "16px", radius: "12px" });
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  await expect(page.locator("[data-footer-lead]").getByRole("link")).toHaveCount(1);
  await expect(page.getByRole("contentinfo").locator("div")).toHaveCSS("padding-bottom", "16px");
  await page.screenshot({ path: info.outputPath("canvas-line-footer.png") });
  await info.attach("canvas-surface", { body: JSON.stringify({ surface, titleX, underline }), contentType: "application/json" });
});

test("Canvas tag selection caps at five and preserves category, search and sort @smoke", async ({ page }) => {
  await page.goto("/en/categories/illustration?q=fixture&tags=minimal,2d,bot-icon,image-to-image,watercolor&sort=latest");
  const menu = await filterMenu(page);
  await expect(menu.getByRole("menuitemcheckbox", { name: "Fixture", exact: true })).toBeDisabled();
  await expect(menu.getByRole("menuitemcheckbox", { checked: true })).toHaveCount(5);
  await menu.getByRole("menuitemcheckbox", { name: "Remove tag Minimal" }).click();
  await expect(page).toHaveURL(/\/en\/categories\/illustration\?q=fixture&tags=2d%2Cbot-icon%2Cimage-to-image%2Cwatercolor&sort=latest$/);
  const reopened = await filterMenu(page);
  await expect(reopened.getByRole("menuitemcheckbox", { name: "Filter by tag Fixture", exact: true })).toBeEnabled();
});

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
    await expect(page.getByRole("menu")).toBeVisible();
    result = await new AxeBuilder({ page }).withTags(WCAG).include('[role="menu"]').analyze();
    expect(result.violations.map((item) => item.id)).toEqual([]);
  });
});

test.describe("responsive gallery", () => {
  test.skip(({ isMobile, browserName }) => isMobile || browserName !== "chromium", "desktop Chromium drives the viewport matrix");

  const matrix: [number, number][] = [
    [375, 2],
    [600, 2],
    [800, 3],
    [1200, 3],
    [1500, 4],
    [1800, 5],
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
