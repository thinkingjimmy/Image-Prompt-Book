/**
 * [INPUT]: 依赖 fixture 内容（31 条已发布 + 1 草稿）与 @playwright/test
 * [OUTPUT]: Gallery E2E：首页双语、搜索/标签/排序/分页 URL 恢复、规范化重定向、空态、404、恶意内容与坏图（AC-01/02/21/23）
 * [POS]: tests/e2e 的列表流程套件
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { expect, SLUG, test } from "./helpers";

const cards = (page: import("@playwright/test").Page) => page.locator("ul.masonry > li");

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
  await expect(card.getByRole("link", { name: "by APG" })).toHaveAttribute("href", "https://x.com/multi_serio_ai");
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
  await page.route("**/fixture-media/examples/fixture-sample-27/**", (route) => route.fulfill({ status: 404 }));
  await page.goto("/en");
  // The card image link is aria-hidden (the title link is the accessible one), so match by label attribute.
  await expect(page.locator('[aria-label="Fixture color block 27 — Image failed to load"]')).toBeVisible();
  await expect(page.locator('[aria-label="Fixture color block 27 — Image failed to load"]')).toHaveCSS("aspect-ratio", /\d/);
});
