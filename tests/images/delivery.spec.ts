/**
 * [INPUT]: Playwright, image-size, real registered source files and the shared Google network blocker.
 * [OUTPUT]: Repeatable HTTP and browser acceptance of real responsive images and deferred original access.
 * [POS]: Image E2E; validates responses and user intent independently of the image-generation helpers.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFile } from "node:fs/promises";
import { imageSize } from "image-size";
import { test as base, expect } from "@playwright/test";
import { blockAnalytics } from "../analytics/network";

const test = base.extend<{ analyticsRequests: string[] }>({
  analyticsRequests: [async ({ context }, use, info) => {
    const requests = await blockAnalytics(context);
    await use(requests);
    await info.attach("intercepted-analytics-requests", { body: JSON.stringify(requests), contentType: "application/json" });
  }, { auto: true }],
});

test("real small/medium responses are resized WebP and originals stay byte-identical", async ({ page, request }, info) => {
  await page.goto("/en/prompts/grokbot-capsule-icon");
  const tray = page.getByRole("group", { name: "Example images" });
  const thumbnail = tray.getByRole("button", { name: "Show example 2", exact: true }).locator("img");
  const candidate = (await thumbnail.getAttribute("srcset"))!.split(",").find((value) => value.trim().endsWith("96w"))!.trim().split(" ")[0]!;
  const response = await request.get(candidate);
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toBe("image/webp");
  expect(response.headers()["cache-control"]).toContain("immutable");
  const bytes = await response.body();
  expect(imageSize(bytes)).toMatchObject({ width: 96, height: 96, type: "webp" });
  expect(bytes.length).toBeLessThan(10_240);
  const source = await readFile("content/prompts/grokbot-capsule-icon/images/blonde.jpg");
  const original = await request.get("/media/grokbot-capsule-icon/blonde.jpg");
  expect(await original.body()).toEqual(source);
  const medium = await request.get(candidate.replace(".w96.webp", ".w640.webp"));
  const mediumBytes = await medium.body();
  expect(imageSize(mediumBytes)).toMatchObject({ width: 640, height: 640 });
  expect(mediumBytes.length).toBeLessThan(source.length / 2);
  await info.attach("actual-image-responses", { body: JSON.stringify({ candidate, thumbnailBytes: bytes.length, mediumBytes: mediumBytes.length, sourceBytes: source.length }), contentType: "application/json" });
});

test("gallery, modal and backdrop use bounded derivatives; originals require explicit intent", async ({ page }, info) => {
  const requested: string[] = [];
  page.on("request", (request) => { if (new URL(request.url()).pathname.startsWith("/media/")) requested.push(request.url()); });
  await page.goto("/en");
  const cards = page.locator("ul.masonry > li img");
  for (const image of await cards.all()) {
    const candidates = (await image.getAttribute("srcset"))!.split(",");
    expect(candidates.every((item) => Number(item.trim().split(" ").at(-1)!.replace("w", "")) <= 960)).toBe(true);
  }
  expect(requested.every((url) => url.includes(".webp"))).toBe(true);
  await info.attach("gallery", { body: await page.screenshot(), contentType: "image/png" });
  await page.locator('main h2 a[href="/en/prompts/grokbot-capsule-icon"]').click();
  const modal = page.getByRole("dialog", { name: "Minimal Bot Icon — Grokbot Style", exact: true });
  await expect(modal).toBeVisible();
  const preview = modal.getByRole("button", { name: /^View larger image:/ }).locator("img");
  await expect(preview).toHaveJSProperty("complete", true);
  const previewSrc = await preview.evaluate((image: HTMLImageElement) => image.currentSrc);
  await modal.getByRole("button", { name: "View full image", exact: true }).click();
  await expect(modal.locator('img[aria-hidden="true"]')).toHaveAttribute("src", previewSrc);
  await info.attach("fit-preview", { body: await page.screenshot(), contentType: "image/png" });
  expect(requested.some((url) => /\/media\/[^/]+\/[^/]+\.(jpg|png)(?:\?|$)/.test(url))).toBe(false);
  await modal.getByRole("button", { name: /^View larger image:/ }).click();
  const zoom = page.getByRole("dialog", { name: /^Example image:/ });
  await expect(zoom).toBeVisible();
  await expect(zoom.getByRole("link", { name: "View original image", exact: true })).toHaveAttribute("href", "/media/grokbot-capsule-icon/pink.jpg");
  await info.attach("zoom", { body: await page.screenshot(), contentType: "image/png" });
  const originalPage = page.waitForEvent("popup");
  await zoom.getByRole("link", { name: "View original image", exact: true }).click();
  const original = await originalPage;
  await expect(original).toHaveURL(/\/media\/grokbot-capsule-icon\/pink\.jpg$/);
  await original.close();
  await page.keyboard.press("Escape");
  await expect(zoom).toHaveCount(0);
  await expect(modal).toBeVisible();
  await info.attach("staged-image-requests", { body: JSON.stringify(requested, null, 2), contentType: "application/json" });
});

test("wide images offer full resolution only after zoom, and arbitrary derivative URLs return 404", async ({ page, request, isMobile }, info) => {
  await page.goto("/en/prompts/mid-century-modern-cover");
  const preview = page.getByRole("button", { name: /^View larger image:/ }).locator("img");
  const before = (await preview.getAttribute("srcset"))!;
  expect(before).not.toContain("1600w");
  await page.getByRole("button", { name: /^View larger image:/ }).click();
  const zoom = page.getByRole("dialog", { name: /^Example image:/ });
  await expect(zoom).toBeVisible();
  const enlarged = zoom.locator("img");
  await expect(enlarged).toHaveAttribute("srcset", /1600w/);
  const candidate = (await enlarged.getAttribute("src"))!;
  expect((await request.get(candidate.replace(/\.w\d+\.webp$/, ".w999.webp"))).status()).toBe(404);
  expect((await request.get(candidate.replace(/\.[a-f0-9]{12}\.w/, ".000000000000.w"))).status()).toBe(404);
  expect((await request.get("/media/grokbot-capsule-icon/unregistered.jpg")).status()).toBe(404);
  if (!isMobile) await expect(enlarged).toHaveJSProperty("complete", true);
  await info.attach("wide-image-zoom", { body: await page.screenshot(), contentType: "image/png" });
});
