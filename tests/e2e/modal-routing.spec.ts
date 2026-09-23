/**
 * [INPUT]: 依赖 fixture 内容与 ./helpers 的 pickOption/output
 * [OUTPUT]: 路由弹窗 E2E：普通点击弹窗、关闭/后退/前进恢复列表与滚动、刷新与新标签为独立详情、语言切换保留草稿、Esc 分层（AC-03/04/05/12/17）
 * [POS]: tests/e2e 的详情导航套件
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { expect, pickOption, SLUG, test } from "./helpers";

test("a card opens the modal over the list; closing restores filters, page, scroll and focus @smoke", async ({ page }) => {
  await page.goto("/en/categories/illustration?page=2");
  const link = page.locator("main h2 a").last();
  await link.scrollIntoViewIfNeeded();
  const scrollBefore = await page.evaluate(() => window.scrollY);
  const href = await link.getAttribute("href");
  await link.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.locator("ul.masonry")).toBeAttached();

  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/en\/categories\/illustration\?page=2$/);
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore)).toBeLessThan(40);
  await expect(page.locator(`main h2 a[href="${href}"]`)).toBeFocused();
});

test("browser back closes the modal and forward reopens it", async ({ page }) => {
  await page.goto("/en?tags=watercolor");
  await page.locator("main h2 a").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/en\?tags=watercolor$/);
  await page.goForward();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page).toHaveURL(/\/en\?tags=watercolor$/);
});

test("direct visits and refreshes render the standalone detail", async ({ page }) => {
  const response = await page.goto(`/en/prompts/${SLUG}`);
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Minimal Bot Icon — Grokbot Style");
  await expect(page.getByRole("link", { name: "Back to gallery" })).toHaveAttribute("href", "/en");

  await page.goto("/en");
  await page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.reload();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
});

test("modifier-click opens the standalone detail in a new tab", async ({ page, context }) => {
  await page.goto("/en");
  const [popup] = await Promise.all([context.waitForEvent("page"), page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).click({ modifiers: ["ControlOrMeta"] })]);
  // A new tab starts as about:blank; wait for the real navigation instead of the first load event.
  await popup.waitForURL(new RegExp(`/en/prompts/${SLUG}$`));
  // Modifier-clicks open background tabs whose animation frames are throttled, so read state once instead of polling.
  expect(await popup.locator('[role="dialog"]').count()).toBe(0);
  expect(await popup.locator("h1").textContent()).toBe("Minimal Bot Icon — Grokbot Style");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("source links on cards open the source, not the detail", async ({ page, context }) => {
  await page.goto("/en");
  const [popup] = await Promise.all([context.waitForEvent("page"), page.locator("main").getByRole("link", { name: "APG", exact: true }).click()]);
  expect(popup.url()).toContain("x.com/multi_serio_ai");
  await popup.close();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/en$/);
});

test("switching the site language keeps the slug and options and switches the prompt language", async ({ page }) => {
  await page.goto(`/en/prompts/${SLUG}`);
  await pickOption(page, "tilt", "Strong 20°");
  await page.locator("footer").getByRole("button", { name: "Language" }).click();
  await page.getByRole("menuitem", { name: "简体中文" }).click();
  await expect(page).toHaveURL(new RegExp(`/zh-CN/prompts/${SLUG}$`));
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('[data-parameter="tilt"]')).toHaveText(/20°/);
  await expect(page.getByTestId("prompt-text")).toContainText("头部倾斜约 20°");
});

test("Esc closes the innermost layer first: select, then lightbox, then detail", async ({ page }) => {
  await page.goto("/en");
  await page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).click();
  const dialog = page.getByRole("dialog").first();
  await expect(dialog).toBeVisible();

  await dialog.locator('[data-parameter="background"]').click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: /View larger image/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(2);
  // The lightbox owns Esc once it has taken focus.
  await expect(page.getByRole("dialog").last().getByRole("button", { name: "Close" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(1);

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/en$/);
});

test("the modal traps focus and starts on the title, not an input", async ({ page }) => {
  await page.goto("/en");
  await page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-modal-title]")).toBeFocused();
  for (let index = 0; index < 40; index++) await page.keyboard.press("Tab");
  expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
});
