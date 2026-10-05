/**
 * [INPUT]: Fixture content (54 published entries and one draft), Playwright Page, and shared hydrated/isolated browser, navigation and language-menu helpers.
 * [OUTPUT]: Gallery dropdown/sort/sidebar/pagination E2E, attribution-preserving normalization with clean metadata, prompt/collection modal/history/locale/focus navigation, and image-comparison checks.
 * [POS]: Gallery and detail navigation suite; campaign normalization saves a screenshot alongside its browser trace.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Page } from "@playwright/test";
import { expect, filterMenu, languageMenu, navigationRoot, pickOption, searchField, SLUG, test } from "./helpers";

const cards = (page: Page) => page.locator("ul.masonry > li");

test.describe("gallery", () => {
  test("root redirects to /en and both locales render real cards @smoke", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Explore image prompts. Make them yours.");
    await expect(cards(page)).toHaveCount(49);
    await expect(page.locator("[data-collection-card]")).toHaveCount(1);
    await expect(cards(page).first().getByRole("heading")).toHaveText("Minimal Bot Icon — Grokbot Style");
    const navigation = await navigationRoot(page);
    await expect(navigation.getByRole("link", { name: "Collections", exact: true })).toHaveAttribute("href", "/en/collections");
    if (await page.getByRole("dialog").isVisible()) await page.keyboard.press("Escape");
    await expect(page.locator("[data-footer-lead]").getByRole("link", { name: "All collections" })).toHaveAttribute("href", "/en/collections");

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
    await expect(card.getByText("Needs a reference image")).toHaveCount(0);
    await expect(card.locator('a[href*="?tags="]')).toHaveCount(0);
    await expect(card.getByRole("link", { name: "APG", exact: true })).toHaveAttribute("href", "https://x.com/multi_serio_ai");
    // Image-first cards: no summary text.
    await expect(card.getByText("Turn a person or character")).toHaveCount(0);
  });

  test("pagination uses real links and normalizes page numbers while preserving attribution", async ({ page }, info) => {
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
    await expect(page).toHaveURL(/\/en\?utm_source=x$/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://imagepromptbook.com/en");
    await info.attach("normalized-campaign-landing", { body: await page.screenshot(), contentType: "image/png" });
    expect((await page.request.get("/en?page=3", { maxRedirects: 0 })).status()).toBe(404);
  });

  test("search is debounced, AND-matched, case/width-insensitive and restorable", async ({ page }) => {
    await page.goto("/en");
    const search = await searchField(page);
    await search.fill("ＺＥＢＲＡ");
    await expect(page).toHaveURL(/q=ZEBRA/);
    await expect(cards(page)).toHaveCount(1);
    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Search prompts" })).toHaveValue("ZEBRA");
    await expect(cards(page)).toHaveCount(1);

    await search.fill("fixture watercolor");
    await search.press("Enter");
    await expect(page).toHaveURL(/q=fixture\+watercolor/);
    await expect(page.getByText("17 prompts")).toBeVisible();

    // Chinese labels are searchable from any UI language.
    await page.goto("/en?q=%E6%9C%BA%E5%99%A8%E4%BA%BA");
    await expect(cards(page)).toHaveCount(1);
  });

  test("the filter dropdown combines tags with AND and unknown tags are dropped", async ({ page }) => {
    await page.goto("/en?tags=watercolor,bogus&page=1");
    await expect(page).toHaveURL(/\/en\?tags=watercolor$/);
    await expect(page.getByText("17 prompts")).toBeVisible();

    await (await filterMenu(page)).getByRole("menuitemcheckbox", { name: "Filter by tag Fixture", exact: true }).click();
    await expect(page).toHaveURL(/tags=watercolor%2Cfixture-only/);
    await expect(page.getByText("17 prompts")).toBeVisible();
    await (await filterMenu(page)).getByRole("menuitemcheckbox", { name: "Filter by tag Minimal", exact: true }).click();
    await expect(page.getByText("No prompts match these filters")).toBeVisible();
    await (await filterMenu(page)).getByRole("menuitemcheckbox", { name: "Remove tag Minimal" }).click();
    await expect(page).toHaveURL(/tags=watercolor%2Cfixture-only$/);
    await page.getByRole("main").getByRole("link", { name: "Clear filters" }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect((await filterMenu(page)).getByRole("menuitem", { name: "All tags", exact: true })).toHaveAttribute("aria-current", "true");
  });

  test("sidebar category navigation starts a fresh gallery", async ({ page }) => {
    await page.goto("/en?q=fixture");
    const navigation = await navigationRoot(page);
    await navigation.getByRole("link", { name: /^Illustration/ }).click();
    await expect(page).toHaveURL(/\/en\/categories\/illustration$/);
    await expect(page.locator("#site-search")).toHaveValue("");
  });

  test("featured and latest sorts are deterministic", async ({ page }) => {
    await page.goto("/en");
    await expect(cards(page).nth(1).getByRole("heading")).toHaveText("Fixture sample 2");
    await page.getByRole("navigation", { name: "Sort" }).getByRole("link", { name: "Latest" }).click();
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
    await expect(cards(page)).toHaveCount(49);
    await expect(page.locator("[data-collection-card]")).toHaveCount(1);
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
  test("a prompt's collection link opens a modal and returns to the standalone prompt @smoke", async ({ page }) => {
    await page.goto(`/en/prompts/${SLUG}`);
    const link = page.getByTestId("prompt-about").getByRole("link", { name: "Fixture collection: how to pick these three prompts" });
    await link.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/en\/collections\/fixture-collection$/);
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`/en/prompts/${SLUG}$`));
    await expect(link).toBeFocused();
  });

  test("collection cards open a modal; nested prompts return to the collection scroll and focus @smoke", async ({ page }, info) => {
    await page.goto("/en");
    const card = page.locator("[data-collection-card]");
    await expect(card.getByText(/Curated by|Updated|3 prompts/)).toHaveCount(0);
    const title = card.locator("h2 a");
    await card.locator('a[aria-hidden="true"]').click();
    await expect(page).toHaveURL(/\/en\/collections\/fixture-collection$/);
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("[data-modal-title]")).toBeFocused();
    await expect(page.locator("ul.masonry")).toBeAttached();
    const member = dialog.locator("h3 a").last();
    const href = await member.getAttribute("href");
    await member.scrollIntoViewIfNeeded();
    const before = await dialog.locator(".detail-modal-viewport").evaluate((node) => node.scrollTop);
    await page.screenshot({ path: info.outputPath("collection-modal.png") });
    await member.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect(dialog.getByTestId("prompt-text")).toBeVisible();
    await dialog.getByRole("button", { name: "Close", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/collections\/fixture-collection$/);
    await expect(dialog.locator("h3 a").last()).toBeFocused();
    await expect.poll(async () => Math.abs((await dialog.locator(".detail-modal-viewport").evaluate((node) => node.scrollTop)) - before)).toBeLessThan(40);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(page).toHaveURL(/\/en$/);
    await expect(title).toBeFocused();
    await page.goForward();
    await expect(dialog).toBeVisible();
    await page.reload();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Fixture collection: how to pick these three prompts");
    await info.attach("collection-return", { body: JSON.stringify({ href, scrollBefore: before, refreshedUrl: page.url() }), contentType: "application/json" });
  });

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
    await popup.waitForURL(new RegExp(`/en/prompts/${SLUG}$`), { waitUntil: "domcontentloaded" });
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

  test("switching the site language keeps the slug and options and switches the prompt language @smoke", async ({ page }) => {
    await page.goto(`/en/prompts/${SLUG}`);
    await pickOption(page, "tilt", "Strong 20°");
    const language = await languageMenu(page);
    await language.getByRole("menuitem", { name: "简体中文", exact: true }).click();
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
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toHaveCount(0);
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

test.describe("before/after comparison", () => {
  const COMPARED = "fixture-sample-02";

  test("the card shows a static split of the input photo and the result", async ({ page }) => {
    await page.goto("/en");
    const card = cards(page).filter({ has: page.locator(`h2 a[href="/en/prompts/${COMPARED}"]`) });
    await expect(card.getByAltText("Fixture input photo 2")).toBeVisible();
    await expect(card.getByAltText("Fixture color block 2")).toBeVisible();
    // Only the detail page is interactive.
    await expect(card.getByRole("slider")).toHaveCount(0);
  });

  test("the detail page compares by dragging and by keyboard, without opening the lightbox", async ({ page }, testInfo) => {
    await page.goto(`/en/prompts/${COMPARED}`);
    const slider = page.getByRole("slider", { name: "Compare the original photo and the result" });
    await expect(slider).toHaveAttribute("aria-valuenow", "50");
    await expect(page.getByText("Original", { exact: true })).toBeVisible();
    await expect(page.getByText("Result", { exact: true })).toBeVisible();

    const frame = page.getByTestId("compare-slider");
    const box = (await frame.boundingBox())!;
    const y = box.y + box.height / 2;
    await page.mouse.move(box.x + box.width / 2, y);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * 0.25, y, { steps: 5 });
    await page.mouse.up();
    const dragged = Number(await slider.getAttribute("aria-valuenow"));
    expect(dragged).toBeGreaterThan(20);
    expect(dragged).toBeLessThan(30);
    await expect(page.getByRole("dialog")).toHaveCount(0);

    await slider.focus();
    await page.keyboard.press("End");
    await expect(slider).toHaveAttribute("aria-valuenow", "100");
    await page.keyboard.press("Home");
    await page.keyboard.press("ArrowRight");
    await expect(slider).toHaveAttribute("aria-valuenow", "5");

    await page.keyboard.press("End");
    await page.keyboard.press("ArrowLeft");
    await page.keyboard.press("ArrowLeft");
    await page.screenshot({ path: testInfo.outputPath("compare-detail.png") });
  });

  test("examples without an input photo keep click-to-zoom and the fit toggle", async ({ page }) => {
    await page.goto(`/en/prompts/${SLUG}`);
    await expect(page.getByRole("slider")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "View full image" })).toBeVisible();
  });
});
