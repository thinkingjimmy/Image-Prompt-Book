/**
 * [INPUT]: Real PromptEntry records, independent expectations, and a running local site.
 * [OUTPUT]: checkEntry(), PromptChecks, bilingual UI and comparison-control assertions, screenshots, and traces.
 * [POS]: scripts/prompts browser verification; shared by every import instead of per-entry scripts.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { expect, type Browser, type Page } from "@playwright/test";
import { LOCALES, type Locale } from "@/i18n/config";
import type { PromptEntry, PromptVariant } from "@/lib/content/load";
import { composePrompt, defaultSelections, type Selections } from "@/lib/prompt/template";
import { mediaUrl } from "@/lib/site";
import en from "@/i18n/messages/en.json";
import zh from "@/i18n/messages/zh-CN.json";

export type PromptChecks = {
  originalSha256?: string;
  variants?: Record<string, {
    defaultPaths?: Partial<Record<Locale, string>>;
    requiredText?: Partial<Record<Locale, string[]>>;
  }>;
};

const messages = { en: en.detail, "zh-CN": zh.detail };

async function captureClipboard(page: Page) {
  // Send plain JavaScript: tsx name-preservation helpers do not exist in the page.
  await page.addInitScript({ content: `
    const copied = [];
    Object.defineProperty(window, "__ipbCopied", { value: copied });
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: async (value) => { copied.push(value); } }
    });
  ` });
}

async function copy(page: Page): Promise<string> {
  const count = await page.evaluate(() => (Reflect.get(window, "__ipbCopied") as string[]).length);
  await page.getByTestId("copy-prompt").click();
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, "__ipbCopied") as string[]).length)).toBe(count + 1);
  return page.evaluate(() => (Reflect.get(window, "__ipbCopied") as string[]).at(-1)!);
}

async function pick(page: Page, parameterId: string, label: string) {
  // A parameter can occur more than once in the author's text; all chips share state.
  await page.locator(`[data-parameter="${parameterId}"]`).first().click();
  await page.getByRole("menuitemradio", { name: label, exact: true }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
}

async function ready(page: Page, url: string) {
  const response = await page.goto(url, { waitUntil: "networkidle" });
  assert.equal(response?.status(), 200, url);
  await expect(page.getByTestId("prompt-text")).toBeVisible();
}

function expected(variant: PromptVariant, locale: Locale, selections = defaultSelections(variant.parameters)) {
  return composePrompt({ record: variant, selections, outputLocale: locale });
}

async function checkOptions(page: Page, variant: PromptVariant, locale: Locale) {
  const selections = defaultSelections(variant.parameters);
  assert.equal(await copy(page), expected(variant, locale));
  for (const parameter of variant.parameters) {
    for (const option of parameter.options) {
      await pick(page, parameter.id, option.labels[locale]);
      selections[parameter.id] = option.id;
      assert.equal(await copy(page), expected(variant, locale, selections));
    }
    const original = parameter.options.find((option) => option.id === parameter.default)!;
    await pick(page, parameter.id, original.labels[locale]);
    selections[parameter.id] = parameter.default;
  }
  const changed: Selections = {};
  for (const parameter of variant.parameters) {
    const option = parameter.options.find((item) => item.id !== parameter.default)!;
    changed[parameter.id] = option.id;
    await pick(page, parameter.id, option.labels[locale]);
  }
  assert.equal(await copy(page), expected(variant, locale, changed));
  await expect(page.getByTestId("use-in-chatgpt")).toHaveAttribute("href", `https://chatgpt.com/?prompt=${encodeURIComponent(expected(variant, locale, changed))}`);
  return changed;
}

async function checkShare(page: Page, base: string, entry: PromptEntry, variant: PromptVariant, locale: Locale, selections: Selections) {
  const count = await page.evaluate(() => (Reflect.get(window, "__ipbCopied") as string[]).length);
  await page.getByRole("button", { name: messages[locale].share, exact: true }).click();
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, "__ipbCopied") as string[]).length)).toBe(count + 1);
  const shared = await page.evaluate(() => (Reflect.get(window, "__ipbCopied") as string[]).at(-1)!);
  const url = new URL(shared);
  assert.equal(url.pathname, `/${locale}/prompts/${entry.meta.slug}`);
  const restored = await page.context().newPage();
  try {
    await captureClipboard(restored);
    // A local production build may have the deployed canonical host; keep the hash and test locally.
    await ready(restored, `${base}${url.pathname}${url.hash}`);
    assert.equal(await copy(restored), expected(variant, locale, selections));
  } finally {
    await restored.close();
  }
  if (variant.parameters.length > 0) {
    await page.getByRole("button", { name: messages[locale].reset, exact: true }).click();
    assert.equal(await copy(page), expected(variant, locale));
  }
}

async function checkComparison(page: Page) {
  const frame = page.getByTestId("compare-slider");
  const handle = frame.getByRole("slider");
  await expect(handle).toHaveAttribute("aria-valuemin", "0");
  await expect(handle).toHaveAttribute("aria-valuemax", "100");
  await expect(handle).toHaveAttribute("aria-valuenow", "50");
  for (const [key, value] of [["Home", 0], ["ArrowLeft", 0], ["ArrowRight", 5], ["End", 100], ["ArrowRight", 100], ["ArrowLeft", 95]] as const) {
    await handle.press(key);
    await expect(handle).toHaveAttribute("aria-valuenow", String(value));
  }
  await frame.scrollIntoViewIfNeeded();
  const box = await frame.boundingBox();
  assert(box && box.width > 0 && box.height > 0, "Comparison frame has no area");
  const y = Math.max(box.y + 20, Math.min(box.y + box.height / 3, page.viewportSize()!.height - 20));
  await page.mouse.move(box.x + box.width / 4, y);
  await page.mouse.down();
  await expect(handle).toHaveAttribute("aria-valuenow", "25");
  await page.mouse.move(box.x + box.width * 0.75, y);
  await expect(handle).toHaveAttribute("aria-valuenow", "75");
  await page.mouse.up();
  await page.mouse.move(box.x + box.width / 4, y);
  await expect(handle).toHaveAttribute("aria-valuenow", "75");
}

async function checkImages(page: Page, entry: PromptEntry, locale: Locale) {
  const figure = page.locator("figure").first();
  for (const [index, example] of entry.examples.entries()) {
    if (entry.examples.length > 1) {
      const label = messages[locale].showExample.replace("{index}", String(index + 1));
      await page.getByRole("button", { name: label, exact: true }).click();
    }
    for (const image of [example, ...(example.input ? [example.input] : [])]) {
      const rendered = figure.getByAltText(image.alt[locale], { exact: true });
      await expect(rendered).toHaveCount(1);
      await expect.poll(() => rendered.evaluate((node) => (node as HTMLImageElement).complete && (node as HTMLImageElement).naturalWidth > 0)).toBe(true);
    }
    if (example.input) await checkComparison(page);
  }
  if (entry.examples.length > 1) {
    await page.getByRole("button", { name: messages[locale].showExample.replace("{index}", "1"), exact: true }).click();
  }
  if (entry.examples[0]?.input) {
    const frame = page.getByTestId("compare-slider");
    if (entry.examples.length > 1) await expect(frame.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
    await frame.click({ position: { x: (await frame.boundingBox())!.width / 2, y: 30 } });
    await expect(frame.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  }
}

async function checkMobile(page: Page, variant: PromptVariant, locale: Locale) {
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const parameter of variant.parameters) {
    for (const chip of await page.locator(`[data-parameter="${parameter.id}"]`).all()) {
      const box = await chip.boundingBox();
      assert(box && box.x >= 0 && box.x + box.width <= 376, `${locale}: ${parameter.id} overflows`);
    }
  }
  assert.equal(await copy(page), expected(variant, locale));
}

export async function checkEntry(browser: Browser, entry: PromptEntry, base: string, artifact: string) {
  const results: { locale: Locale; variant: string; optionCount: number }[] = [];
  const started = Date.now();
  mkdirSync(artifact, { recursive: true });
  writeFileSync(path.join(artifact, "README.md"), `# ${entry.meta.slug} verification\n\nBilingual screenshots and traces are in each locale folder. Timings and outcomes are in the parent report.json.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);

  const media = entry.examples.flatMap((example) => [example, ...(example.input ? [example.input] : [])]);
  const mediaContext = await browser.newContext();
  try {
    await Promise.all(media.map(async (image) => {
      const response = await mediaContext.request.get(`${base}${mediaUrl(entry.meta.slug, image.src)}`);
      assert.equal(response.status(), 200, image.src);
      assert((await response.body()).equals(readFileSync(path.join(entry.repoPath, image.src))), `${image.src}: wrong media bytes`);
    }));
    if (entry.meta.status === "published") {
      const sitemap = await mediaContext.request.get(`${base}/sitemap.xml`);
      assert.equal(sitemap.status(), 200);
      const xml = await sitemap.text();
      for (const locale of LOCALES) assert(xml.includes(`/${locale}/prompts/${entry.meta.slug}`), `${locale}: entry missing from sitemap`);
    }
  } finally {
    await mediaContext.close();
  }

  const outcomes = await Promise.allSettled(LOCALES.map(async (locale) => {
    const dir = path.join(artifact, locale);
    mkdirSync(dir, { recursive: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
    await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
    const errors: string[] = [];
    context.on("page", (page) => page.on("pageerror", (error) => errors.push(error.message)));
    const page = await context.newPage();
    try {
      await captureClipboard(page);
      await ready(page, `${base}/${locale}/prompts/${entry.meta.slug}`);
      const content = entry.content[locale]!;
      await expect(page.getByRole("heading", { level: 1, name: content.title, exact: true })).toBeVisible();
      await expect(page.getByTestId("prompt-text")).toHaveAttribute("lang", locale);
      const about = page.getByTestId("prompt-about");
      for (const text of [content.inputRequirement, content.adaptationNotice, content.licenseNotice]) await expect(about).toContainText(text);
      for (const source of entry.meta.sources) {
        await expect(about.locator(`a[href="${source.url}"]`)).toHaveCount(1);
        if (source.author) await expect(about).toContainText(source.author.name);
      }
      await expect(page.getByTestId("attach-notice")).toHaveCount(entry.meta.requiresReferenceImage ? 1 : 0);
      await checkImages(page, entry, locale);

      for (const variant of entry.variants) {
        const variantDir = path.join(dir, variant.id);
        mkdirSync(variantDir, { recursive: true });
        if (entry.variants.length > 1) await page.getByRole("radio", { name: variant.labels![locale], exact: true }).click();
        const changed = await checkOptions(page, variant, locale);
        await checkShare(page, base, entry, variant, locale, changed);
        await page.screenshot({ path: path.join(variantDir, "desktop.png"), fullPage: true });
        await page.setViewportSize({ width: 375, height: 812 });
        await checkMobile(page, variant, locale);
        await checkImages(page, entry, locale);
        await page.screenshot({ path: path.join(variantDir, "mobile.png"), fullPage: true });
        writeFileSync(path.join(variantDir, "README.md"), `# ${variant.id} screenshots\n\nDesktop: 1440 px. Mobile: 375 px. Checks run against the real entry.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
        await page.setViewportSize({ width: 1440, height: 1000 });
        results.push({ locale, variant: variant.id, optionCount: variant.parameters.reduce((sum, parameter) => sum + parameter.options.length, 0) });
      }
      if (entry.meta.status === "published") {
        const response = await page.goto(`${base}/${locale}?q=${encodeURIComponent(content.title)}&sort=latest`, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200);
        await expect(page.locator(`a[href="/${locale}/prompts/${entry.meta.slug}"]`).first()).toBeVisible();
        if (entry.examples[0]?.input) {
          const cover = entry.examples[0];
          const card = page.locator("article").filter({ has: page.getByRole("heading", { name: content.title, exact: true }) });
          for (const image of [cover, cover.input!]) await expect(card.getByAltText(image.alt[locale], { exact: true })).toHaveCount(1);
          await expect(card.locator("[style*='clip-path']")).toHaveCSS("clip-path", "inset(0px 50% 0px 0px)");
        }
        await page.screenshot({ path: path.join(dir, "gallery.png"), fullPage: true });
      }
      assert.deepEqual(errors, [], `${locale}: browser errors`);
    } finally {
      await context.tracing.stop({ path: path.join(dir, "browser-trace.zip") });
      await context.close();
      writeFileSync(path.join(dir, "README.md"), `# ${locale} browser artifacts\n\nScreenshots cover each variant at 1440 px and 375 px. browser-trace.zip records the actual UI interactions; gallery.png is present for published entries.\n\n[PROTOCOL]: Update this header when making changes, then check README.md.\n`);
    }
  }));
  const failures = outcomes.filter((outcome) => outcome.status === "rejected");
  if (failures.length) throw new AggregateError(failures.map((failure) => failure.reason), `${entry.meta.slug}: bilingual browser checks failed`);
  results.sort((left, right) => LOCALES.indexOf(left.locale) - LOCALES.indexOf(right.locale));
  return { slug: entry.meta.slug, status: entry.meta.status, images: entry.examples.length, durationMs: Date.now() - started, results };
}
