/**
 * [INPUT]: 依赖 mobile 项目（Pixel 7 视口）与 ./helpers
 * [OUTPUT]: 移动端 E2E：无横向溢出、全屏弹窗、底部操作区可见且不遮挡内容（AC-17）
 * [POS]: tests/e2e 的窄屏套件，仅在 mobile 项目运行
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { expect, SLUG, test } from "./helpers";

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
