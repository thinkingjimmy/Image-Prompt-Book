/**
 * [INPUT]: 依赖 ./helpers 的剪贴板/存储注入、expectedPrompt（由同一内容计算的期望全文）、copyPrompt
 * [OUTPUT]: 编辑器 E2E：七个参数 chip 联动、Use in ChatGPT 预填、Prompt 语言跟随站点语言、恢复默认、分享 hash 恢复与回退、存储/剪贴板失败、来源说明（AC-06/12–15/21）
 * [POS]: tests/e2e 的参数化 Prompt 套件
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Page } from "@playwright/test";
import { breakSessionStorage, captureClipboard, copied, copyPrompt, denyClipboard, expect, expectedPrompt, pickOption, SLUG, test } from "./helpers";

const DETAIL = `/en/prompts/${SLUG}`;
const ALL_CHANGED = { faceColor: "pale-peach", blush: "none", background: "deep-plum", composition: "lower-right", tilt: "20", coloring: "vivid", outline: "thin" };

async function changeEverything(page: Page) {
  await pickOption(page, "faceColor", "Pale peach");
  await pickOption(page, "blush", "No blush");
  await pickOption(page, "background", "Deep plum");
  await pickOption(page, "composition", "Peek from lower right");
  await pickOption(page, "tilt", "Strong 20°");
  await pickOption(page, "coloring", "Vivid flat");
  await pickOption(page, "outline", "Thin soft outlines");
}

test.beforeEach(async ({ page }, info) => {
  if (!info.title.includes("clipboard is denied")) await captureClipboard(page);
});

test("all seven parameters update the prompt text and the copied prompt identically @smoke", async ({ page }) => {
  await page.goto(DETAIL);
  expect(await copyPrompt(page)).toBe(expectedPrompt({}, "en"));
  await changeEverything(page);

  const text = page.getByTestId("prompt-text");
  await expect(text).toContainText("peeking in from the lower right, head tilted counterclockwise");
  await expect(text).toContainText("no blush on the cheeks");
  await expect(text).not.toContainText("oval blush");
  await expect(page.locator('[data-parameter="background"]')).toHaveText(/deep plum/);

  expect(await copyPrompt(page)).toBe(expectedPrompt(ALL_CHANGED, "en"));
  await expect(page.getByRole("status")).toContainText("Prompt copied.");
});

test("the prompt is shown and copied in the site language only", async ({ page }) => {
  await page.goto(`/zh-CN/prompts/${SLUG}`);
  await expect(page.getByTestId("prompt-text")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("radio")).toHaveCount(0);
  await expect(page.getByRole("tab")).toHaveCount(0);
  await pickOption(page, "background", "午夜蓝");
  expect(await copyPrompt(page)).toBe(expectedPrompt({ background: "midnight-blue" }, "zh-CN"));
});

test("reset restores only this prompt's options", async ({ page }) => {
  await page.goto(DETAIL);
  await changeEverything(page);
  await page.getByRole("button", { name: "Reset options" }).click();
  await expect(page.getByRole("status")).toContainText("Options reset to defaults.");
  expect(await copyPrompt(page)).toBe(expectedPrompt({}, "en"));
});

test("a settings link restores the options in a new tab and then leaves a clean URL", async ({ page, context }) => {
  await page.goto(DETAIL);
  await changeEverything(page);
  await page.getByRole("button", { name: "Share and attribution" }).click();
  await page.getByRole("menuitem", { name: "Copy link with my options" }).click();
  const [link] = await copied(page);
  expect(link).toBe(
    "http://localhost:3200/en/prompts/grokbot-capsule-icon#v=1&template=2.0.0&output=en&p.faceColor=pale-peach&p.blush=none&p.background=deep-plum&p.composition=lower-right&p.tilt=20&p.coloring=vivid&p.outline=thin",
  );

  const other = await context.newPage();
  await captureClipboard(other);
  await other.goto(link!);
  await expect(other.getByRole("status")).toContainText("Loaded the shared options.");
  expect(await copyPrompt(other)).toBe(expectedPrompt(ALL_CHANGED, "en"));
  await expect(other).toHaveURL(new RegExp(`/en/prompts/${SLUG}$`));
});

test("the template link is clean and attribution is copied separately", async ({ page }) => {
  await page.goto(`${DETAIL}?utm=1`);
  await page.getByRole("button", { name: "Share and attribution" }).click();
  await page.getByRole("menuitem", { name: "Copy template link" }).click();
  await page.getByRole("button", { name: "Share and attribution" }).click();
  await page.getByRole("menuitem", { name: "Copy attribution" }).click();
  const [link, attribution] = await copied(page);
  expect(link).toBe(`http://localhost:3200/en/prompts/${SLUG}`);
  expect(attribution).toContain("Author/licensor: APG (@multi_serio_ai)");
  expect(attribution).toContain("License: CC BY-NC 4.0");
});

test("an outdated or broken hash shows defaults with a notice, never the old draft", async ({ page }) => {
  await page.goto(DETAIL);
  await pickOption(page, "coloring", "Vivid flat");
  // Arriving from elsewhere (a fresh document load), as a shared link would.
  await page.goto("/en/about");
  await page.goto(`${DETAIL}#v=1&template=1.0.0&output=zh-CN&p.coloring=vivid`);
  await expect(page.getByRole("status")).toContainText("another template version");
  await expect(page).toHaveURL(new RegExp(`${DETAIL}$`));
  expect(await copyPrompt(page)).toBe(expectedPrompt({}, "en"));

  // Pasting a link into the same tab only changes the hash; it must still be applied.
  await page.evaluate(() => {
    window.location.hash = "v=1&template=2.0.0&output=en&p.blush=%3Cimg%20src%3Dx%20onerror%3Dalert(1)%3E&p.skin=blue&p.coloring=vivid";
  });
  await expect(page.getByRole("status")).toContainText("were not recognized");
  expect(await copyPrompt(page)).toBe(expectedPrompt({ coloring: "vivid" }, "en"));
});

test("a draft survives reloads in the same tab", async ({ page }) => {
  await page.goto(DETAIL);
  await pickOption(page, "tilt", "Gentle 10°");
  await page.reload();
  await expect(page.locator('[data-parameter="tilt"]')).toHaveText(/10°/);
});

test("editing and copying still work when session storage is unavailable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await breakSessionStorage(page);
  await page.goto(DETAIL);
  await pickOption(page, "blush", "No blush");
  expect(await copyPrompt(page)).toBe(expectedPrompt({ blush: "none" }, "en"));
  expect(errors).toEqual([]);
});

test("when the clipboard is denied the full text is offered for manual copy", async ({ page }) => {
  await denyClipboard(page);
  await page.goto(DETAIL);
  await page.getByRole("button", { name: "Copy prompt" }).click();
  const manual = page.getByRole("dialog", { name: "Copy manually" });
  await expect(manual).toBeVisible();
  await expect(manual.getByTestId("manual-copy")).toHaveValue(expectedPrompt({}, "en"));
  await expect(page.getByRole("status")).not.toContainText("copied");
});

test("Use in ChatGPT pre-fills the current prompt and also copies it", async ({ page, context }) => {
  await page.goto(DETAIL);
  await pickOption(page, "outline", "Thin soft outlines");
  const expected = expectedPrompt({ outline: "thin" }, "en");
  const link = page.getByTestId("use-in-chatgpt");
  await expect(link).toHaveAttribute("href", `https://chatgpt.com/?prompt=${encodeURIComponent(expected)}`);
  await expect(link).toHaveAttribute("target", "_blank");
  // Stop at the handoff: never actually load chatgpt.com from tests.
  await context.route("https://chatgpt.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>stub</title>" }));
  const [popup] = await Promise.all([context.waitForEvent("page"), link.click()]);
  await popup.close();
  await expect.poll(async () => (await copied(page)).at(-1)).toBe(expected);
  await expect(page.getByRole("status")).toContainText("Opened ChatGPT");
});

test("the detail stays minimal: image source and one credit line", async ({ page }) => {
  await page.goto(DETAIL);
  await expect(page.getByText("Example result, not a live preview")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Image source" })).toHaveAttribute("href", "https://grokbot-icon-studio.serio-ai.chatgpt.site/en");
  await expect(page.getByRole("link", { name: "CC BY-NC 4.0" })).toHaveAttribute("href", "https://creativecommons.org/licenses/by-nc/4.0/");
  await expect(page.getByRole("heading", { name: "Source & license" })).toHaveCount(0);

  const src = await page.locator("figure button img").first().getAttribute("src");
  await pickOption(page, "background", "Deep plum");
  expect(await page.locator("figure button img").first().getAttribute("src")).toBe(src);
});
