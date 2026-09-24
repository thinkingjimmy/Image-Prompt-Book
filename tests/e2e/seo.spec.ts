/**
 * [INPUT]: 依赖 fixture 构建（IPB_DEPLOY_ENV=production、SITE_URL=https://imagepromptbook.com）
 * [OUTPUT]: SEO E2E：服务端 HTML 完整性（含“关于这个 Prompt”全部字段）、画廊 H1 对人可见且位于网格之后的页脚首段、无 JS 可读默认 Prompt、canonical/hreflang/robots 矩阵、sitemap/robots.txt、结构化数据与可见内容一致（摘要、图片署名）、只提供站点实际展示的图片（AC-18/19/21）
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
    // "About this prompt": every authored field is visible text, not only metadata.
    "Turn a person or character in a reference image into a minimal 2D bot face with solid black capsule eyes.",
    "Requires one reference image. Attach it in your image generation tool; this website does not upload or generate images.",
    "Attach one image of the person or character you want to transform, then send.",
    "Source examples have not been reproduced by Image Prompt Book.",
    "Translated and parameterized from the original Korean short prompt.",
    "Prompt: CC BY-NC 4.0. Attribution and noncommercial conditions apply.",
    "Grokbot Icon",
    "checked 2026-09-23",
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

test("gallery headings are visible text that opens the footer, never above the grid", async ({ page }) => {
  for (const [url, heading] of [
    ["/en", "Explore image prompts. Make them yours."],
    ["/en/categories/illustration", "Illustration"],
  ] as const) {
    await page.goto(url);
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1, url).toHaveText(heading);
    const lead = page.locator("[data-footer-lead]");
    await expect(lead.locator("p"), url).not.toBeEmpty();
    // Real text for people, not a 1px screen-reader clip.
    expect((await h1.boundingBox())!.width, url).toBeGreaterThan(40);
    // The gallery stays image-first: the heading comes after the grid and sits flush against the footer.
    expect((await h1.boundingBox())!.y, url).toBeGreaterThan((await page.locator("ul.masonry").boundingBox())!.y);
    const gap = (await page.locator("footer p").first().boundingBox())!.y - (await lead.boundingBox())!.y - (await lead.boundingBox())!.height;
    expect(gap, url).toBeLessThan(40);
  }
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
  expect(work.mainEntityOfPage).toBe(`${ORIGIN}/en/prompts/${SLUG}`);
  await expect(page.getByTestId("prompt-about")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "About this prompt" })).toBeVisible();
  // The description is the summary the page shows, never text only crawlers see.
  await expect(page.locator("main article header")).toContainText(work.description);
  const [sourceImage, ownImage] = work.image;
  expect(sourceImage.creditText).toBe("APG");
  expect(sourceImage.creator).toEqual({ "@type": "Person", name: "APG", url: "https://x.com/multi_serio_ai" });
  expect(ownImage.creditText).toBe("Image Prompt Book");
  expect(ownImage.creator["@type"]).toBe("Organization");
  // No image license is recorded, so none is claimed.
  expect(sourceImage).not.toHaveProperty("license");
  expect(sourceImage).not.toHaveProperty("acquireLicensePage");
  expect(JSON.stringify(data)).not.toMatch(/AggregateRating|Review|ratingValue/);
});

test("only images the site shows are served", async ({ request }) => {
  const shown = await request.get(`/media/${SLUG}/fixture-dark.png`);
  expect(shown.status()).toBe(200);
  expect(shown.headers()["content-type"]).toBe("image/png");
  // Files that sit in an entry folder but are not listed (or belong to a draft) stay private.
  expect((await request.get(`/media/${SLUG}/pink.jpg`)).status()).toBe(404);
  expect((await request.get("/media/fixture-draft/cover.png")).status()).toBe(404);
  expect((await request.get(`/media/${SLUG}/..%2Fmeta.json`)).status()).toBe(404);
});
