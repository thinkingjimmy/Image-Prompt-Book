/**
 * [INPUT]: 依赖 fixture 内容（31 条已发布 + 1 草稿）与 ./helpers 的 test/expect/SLUG/pickOption
 * [OUTPUT]: 浏览流程 E2E：首页双语、搜索/标签/排序/分页 URL 恢复、规范化重定向、空态、404、恶意内容与坏图；路由弹窗的打开/关闭/后退/前进/刷新/新标签、语言切换保留选项、Esc 分层与焦点（AC-01–AC-05/12/17/21/23）
 * [POS]: tests/e2e 的列表与详情导航套件
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Page } from "@playwright/test";
import { expect, pickOption, SLUG, test } from "./helpers";

const cards = (page: Page) => page.locator("ul.masonry > li");

test.describe("gallery", () => {
  test("root redirects to /en and both locales render real cards @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore image prompts. Make them yours.");
    await expect(cards(page)).toHaveCount(24);
    await expect(cards(page).first().getByRole("heading")).toHaveText("Minimal Bot Icon — Grokbot Style");

    await page.goto("/zh-CN");
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("发现喜欢的效果，调整成自己的版本。");
    await expect(cards(page).first().getByRole("heading")).toHaveText("极简机器人头像 · Grokbot 风格");
  });

  test("one prompt occupies exactly one card, with +N for extra examples", async ({ page }) => {
    await page.goto("/en");
    await expect(page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`)).toHaveCount(1);
    const card = cards(page).first();
    await expect(card.getByText("+1", { exact: true })).toBeVisible();
    await expect(card.getByText("Needs a reference image")).toBeVisible();
    await expect(card.getByRole("link", { name: "APG", exact: true })).toHaveAttribute("href", "https://x.com/multi_serio_ai");
    // Image-first cards: no summary text.
    await expect(card.getByText("Turn a person or character")).toHaveCount(0);
  });

  test("pagination uses real links and normalizes page numbers", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByText("Page 1 of 2")).toBeVisible();
    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/\/en\?page=2$/);
    await expect(cards(page)).toHaveCount(6);
    await page.reload();
    await expect(cards(page)).toHaveCount(6);

    await page.goto("/en?page=1");
    await expect(page).toHaveURL(/\/en$/);
    await page.goto("/en?page=abc&utm_source=x");
    await expect(page).toHaveURL(/\/en$/);
    expect((await page.request.get("/en?page=3", { maxRedirects: 0 })).status()).toBe(404);
  });

  test("search is debounced, AND-matched, case/width-insensitive and restorable", async ({ page }) => {
    await page.goto("/en");
    const search = page.getByRole("searchbox", { name: "Search prompts" });
    await search.fill("ＺＥＢＲＡ");
    await expect(page).toHaveURL(/q=ZEBRA/);
    await expect(cards(page)).toHaveCount(1);
    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Search prompts" })).toHaveValue("ZEBRA");
    await expect(cards(page)).toHaveCount(1);

    await search.fill("fixture watercolor");
    await search.press("Enter");
    await expect(page).toHaveURL(/q=fixture\+watercolor/);
    await expect(page.getByText("9 prompts")).toBeVisible();

    // Chinese labels are searchable from any UI language.
    await page.goto("/en?q=%E6%9C%BA%E5%99%A8%E4%BA%BA");
    await expect(cards(page)).toHaveCount(1);
  });

  test("the combined filter menu combines tags with AND and unknown tags are dropped", async ({ page }) => {
    await page.goto("/en?tags=watercolor,bogus&page=1");
    await expect(page).toHaveURL(/\/en\?tags=watercolor$/);
    await expect(page.getByText("9 prompts")).toBeVisible();

    const openFilters = () => page.getByRole("button", { name: "Filter by category and tags" }).click();
    await openFilters();
    await page.getByRole("menuitemcheckbox", { name: "Fixture" }).click();
    await expect(page).toHaveURL(/tags=watercolor%2Cfixture-only/);
    await expect(page.getByText("9 prompts")).toBeVisible();
    await page.getByRole("menuitemcheckbox", { name: "Minimal" }).click();
    await expect(page.getByText("No prompts match these filters")).toBeVisible();
    await page.keyboard.press("Escape");

    const active = page.getByRole("group", { name: "Tags" });
    await active.getByRole("link", { name: "Remove tag Minimal" }).click();
    await expect(page).toHaveURL(/tags=watercolor%2Cfixture-only$/);
    await active.getByRole("link", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.getByRole("group", { name: "Tags" })).toHaveCount(0);
  });

  test("the filter menu switches categories and keeps the search", async ({ page }) => {
    await page.goto("/en?q=fixture");
    await page.getByRole("button", { name: "Filter by category and tags" }).click();
    await page.getByRole("menuitem", { name: "Illustration" }).click();
    await expect(page).toHaveURL(/\/en\/categories\/illustration\?q=fixture$/);
    await expect(page.getByRole("button", { name: "Filter by category and tags" })).toContainText("Illustration");
  });

  test("the + button opens the submit dialog with the issue link", async ({ page }) => {
    await page.goto("/en");
    await page.locator("header").getByRole("button", { name: "Submit a prompt" }).click();
    const dialog = page.getByRole("dialog", { name: "Submit a prompt" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: /Suggest a prompt/ })).toHaveAttribute("href", "https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=source-lead.yml");
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/en$/);
  });

  test("the header shows only the icon, the combined filter and the 👋 link", async ({ page }) => {
    await page.goto("/en");
    const header = page.locator("header");
    await expect(header.getByRole("link", { name: "Image Prompt Book home" })).toHaveText("");
    await expect(header.getByRole("link", { name: "Say hi to Jimmy on X" })).toHaveAttribute("href", "https://x.com/hellojimmywong");
    await expect(header.getByRole("navigation", { name: "Language" })).toHaveCount(0);
  });

  test("featured and latest sorts are deterministic", async ({ page }) => {
    await page.goto("/en");
    await expect(cards(page).nth(1).getByRole("heading")).toHaveText("Fixture sample 2");
    await page.getByRole("combobox", { name: "Sort" }).click();
    await page.getByRole("option", { name: "Latest" }).click();
    await expect(page).toHaveURL(/sort=latest/);
    await expect(cards(page).nth(1).getByRole("heading")).toHaveText("Fixture sample 27");
  });

  test("empty result shows the applied filters and a way out", async ({ page }) => {
    await page.goto("/en?q=nothing-matches-this");
    await expect(page.getByText("No prompts match these filters")).toBeVisible();
    await page.getByRole("main").getByRole("link", { name: "Clear filters" }).last().click();
    await expect(page).toHaveURL(/\/en$/);
  });

  test("categories with content are routes; empty or unknown categories are 404", async ({ page, request }) => {
    await page.goto("/en/categories/illustration");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Illustration");
    await expect(cards(page)).toHaveCount(24);
    expect((await request.get("/en/categories/logos")).status()).toBe(404);
    expect((await request.get("/en/categories/nope")).status()).toBe(404);
  });

  test("drafts, unknown slugs, locales and paths return real 404s; legacy slugs redirect", async ({ request }) => {
    for (const url of ["/en/prompts/fixture-draft", "/en/prompts/does-not-exist", "/fr", "/ko/prompts/grokbot-capsule-icon", "/en/some/unknown/path"]) {
      expect((await request.get(url)).status(), url).toBe(404);
    }
    const legacy = await request.get("/en/prompts/grokbot-icon-legacy", { maxRedirects: 0 });
    expect(legacy.status()).toBe(308);
    expect(legacy.headers().location).toContain(`/en/prompts/${SLUG}`);
  });

  test("hostile content is rendered as text, never executed", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "<script>window.__pwned=1</script> Hostile sample" })).toBeVisible();
    expect(await page.evaluate(() => (window as unknown as { __pwned?: number }).__pwned)).toBeUndefined();
  });

  test("a failed image keeps its space and says so", async ({ page }) => {
    await page.route("**/media/fixture-sample-27/**", (route) => route.fulfill({ status: 404 }));
    await page.goto("/en");
    // The card image link is aria-hidden (the title link is the accessible one), so match by label attribute.
    await expect(page.locator('[aria-label="Fixture color block 27 — Image failed to load"]')).toBeVisible();
    await expect(page.locator('[aria-label="Fixture color block 27 — Image failed to load"]')).toHaveCSS("aspect-ratio", /\d/);
  });
});

test.describe("detail navigation", () => {
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
});
