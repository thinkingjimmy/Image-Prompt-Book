/**
 * [INPUT]: Isolated production-like fixtures and the shared browser request blocker.
 * [OUTPUT]: Browser/HTML checks for disabled analytics, retained attribution and clean SEO URLs.
 * [POS]: Analytics fixture regression suite; production.spec.ts exercises allowed collection safely.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { expect, SLUG, test } from "../e2e/helpers";

const ORIGIN = "https://imagepromptbook.com";

test("fixture pages contain no production tag and make no analytics requests", async ({ page, request, analyticsRequests }) => {
  for (const path of ["/en", "/zh-CN", `/en/prompts/${SLUG}`]) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).not.toContain("G-9XPFRGZTK3");
    expect(html).not.toContain("googletagmanager.com");
    await page.goto(path);
    expect(await page.evaluate(() => typeof Reflect.get(window, "gtag"))).toBe("undefined");
  }
  expect(analyticsRequests).toEqual([]);
});

test("campaign landing URLs stay 200 with clean canonical and hreflang", async ({ page, request }) => {
  const campaign = "utm_source=github&utm_medium=referral&utm_campaign=avatars&utm_id=launch&gclid=test-click";
  for (const path of ["/en", "/zh-CN", "/en/categories/illustration", "/zh-CN/categories/illustration"]) {
    const response = await request.get(`${path}?${campaign}`, { maxRedirects: 0 });
    expect(response.status(), path).toBe(200);
    await page.goto(`${path}?${campaign}`);
    expect(new URL(page.url()).searchParams.get("utm_campaign")).toBe("avatars");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${ORIGIN}${path}`);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "index, follow");
    const alternates = await page.locator('link[rel="alternate"]').evaluateAll((links) => links.map((link) => link.getAttribute("href")));
    expect(alternates).not.toEqual([]);
    expect(alternates.every((href) => !href?.includes("utm_") && !href?.includes("gclid"))).toBe(true);
  }
});

test("list normalization preserves attribution but removes unknown parameters", async ({ page, request }) => {
  const response = await request.get("/en?utm_source=github&sort=featured&q=%20capsule%20&foo=drop&utm_unknown=drop", { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe("/en?q=capsule&utm_source=github");
  const destination = await request.get(response.headers().location!, { maxRedirects: 0 });
  expect(destination.status()).toBe(200);
  await page.goto("/en?q=capsule&utm_source=github");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${ORIGIN}/en?q=capsule`);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, follow");
  await expect(page.locator('link[rel="alternate"]')).toHaveCount(0);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).not.toMatch(/utm_|gclid/);
});
