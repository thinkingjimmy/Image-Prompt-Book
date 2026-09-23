/**
 * [INPUT]: 依赖 fixture 构建（IPB_DEPLOY_ENV=production、SITE_URL=https://imagepromptbook.com）
 * [OUTPUT]: SEO E2E：服务端 HTML 完整性、无 JS 可读默认 Prompt、canonical/hreflang/robots 矩阵、sitemap/robots.txt、结构化数据（AC-18/19/21）
 * [POS]: tests/e2e 的可索引性套件
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Page } from "@playwright/test";
import { expect, SLUG, test } from "./helpers";

const ORIGIN = "https://imagepromptbook.com";

async function head(page: Page) {
  return page.evaluate(() => ({
    canonical: document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href ?? null,
    robots: document.querySelector<HTMLMetaElement>('meta[name="robots"]')?.content ?? null,
    alternates: Object.fromEntries([...document.querySelectorAll<HTMLLinkElement>('link[rel="alternate"][hreflang]')].map((link) => [link.hreflang, link.href])),
    title: document.title,
  }));
}

test("detail HTML carries the title, default prompt, original, sources and images without JS @smoke", async ({ request }) => {
  const response = await request.get(`/en/prompts/${SLUG}`);
  expect(response.status()).toBe(200);
  const html = await response.text();
  for (const needle of [
    "<title>Minimal Bot Icon Prompt (Grokbot Style) | Image Prompt Book</title>",
    "The eyes are exactly two identical, parallel, solid black vertical capsules (length to width 3:1).",
    "Generate one image.",
    "APG",
    "CC BY-NC 4.0",
    "Fixture: solid dark square standing in for a bot icon",
  ]) {
    expect(html, needle).toContain(needle);
  }
  expect(html).not.toContain("AggregateRating");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the default prompt is readable", async ({ page }) => {
    await page.goto(`/zh-CN/prompts/${SLUG}`);
    await expect(page.getByTestId("prompt-text")).toBeVisible();
    await expect(page.getByTestId("prompt-text")).toContainText("眼睛是两个大小相同、彼此平行的黑色单色竖向胶囊");
    await expect(page.getByRole("link", { name: "下一页" })).toHaveCount(0);
  });

  test("cards and pagination are plain links", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/page=2/);
    await page.locator("main h2 a").first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test("detail pages are self-canonical with reciprocal hreflang", async ({ page }) => {
  await page.goto(`/zh-CN/prompts/${SLUG}#v=1&template=2.0.0&output=en`);
  const meta = await head(page);
  expect(meta.canonical).toBe(`${ORIGIN}/zh-CN/prompts/${SLUG}`);
  expect(meta.robots).toBe("index, follow");
  expect(meta.alternates).toEqual({
    en: `${ORIGIN}/en/prompts/${SLUG}`,
    "zh-CN": `${ORIGIN}/zh-CN/prompts/${SLUG}`,
    "x-default": `${ORIGIN}/en/prompts/${SLUG}`,
  });
  expect(meta.alternates).not.toHaveProperty("ko");
});

test("default pagination is indexable and self-canonical; filtered listings are noindex,follow", async ({ page }) => {
  await page.goto("/en?page=2");
  let meta = await head(page);
  expect(meta.canonical).toBe(`${ORIGIN}/en?page=2`);
  expect(meta.robots).toBe("index, follow");
  expect(meta.title).toContain("Page 2");

  await page.goto("/en/categories/illustration");
  meta = await head(page);
  expect(meta.canonical).toBe(`${ORIGIN}/en/categories/illustration`);
  expect(meta.alternates["zh-CN"]).toBe(`${ORIGIN}/zh-CN/categories/illustration`);

  for (const url of ["/en?q=zebra", "/en?tags=watercolor", "/en?sort=latest"]) {
    await page.goto(url);
    meta = await head(page);
    expect(meta.robots, url).toBe("noindex, follow");
    expect(meta.canonical, url).toBe(`${ORIGIN}${url}`);
    expect(Object.keys(meta.alternates), url).toEqual([]);
  }
});

test("sitemap lists only published pages with real dates and translations", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toContain(`<loc>${ORIGIN}/en/prompts/${SLUG}</loc>`);
  expect(xml).toContain(`<loc>${ORIGIN}/zh-CN/prompts/${SLUG}</loc>`);
  expect(xml).toContain(`hreflang="zh-CN" href="${ORIGIN}/zh-CN/prompts/${SLUG}"`);
  expect(xml).toContain("<lastmod>2026-09-23</lastmod>");
  expect(xml).toContain(`<loc>${ORIGIN}/en/categories/illustration</loc>`);
  expect(xml).not.toContain("fixture-draft");
  expect(xml).not.toContain("/categories/logos");
  expect(xml).not.toMatch(/<loc>[^<]*\?/);
});

test("robots.txt allows crawling filtered pages and points to the sitemap", async ({ request }) => {
  const text = await (await request.get("/robots.txt")).text();
  expect(text).toContain("Allow: /");
  expect(text).not.toMatch(/Disallow: \/\s*$/m);
  expect(text).toContain(`Sitemap: ${ORIGIN}/sitemap.xml`);
});

test("structured data is valid JSON and matches visible facts", async ({ page }) => {
  await page.goto(`/en/prompts/${SLUG}`);
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const data = blocks.flatMap((block) => JSON.parse(block));
  const work = data.find((item: { "@type": string }) => item["@type"] === "CreativeWork");
  expect(work.name).toBe("Minimal Bot Icon — Grokbot Style");
  expect(work.license).toBe("https://creativecommons.org/licenses/by-nc/4.0/");
  expect(work.author.name).toBe("APG");
  expect(JSON.stringify(data)).not.toMatch(/AggregateRating|Review|ratingValue/);
});

test("fixture media is never served as public assets", async ({ request }) => {
  expect((await request.get(`/examples/${SLUG}/fixture-dark.png`)).status()).toBe(404);
});
