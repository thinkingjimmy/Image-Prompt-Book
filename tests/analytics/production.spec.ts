/**
 * [INPUT]: Local real-content production server, browser origin routing and intercepted Google requests.
 * [OUTPUT]: Origin gating, action event accuracy/privacy and tag initialization browser evidence.
 * [POS]: Production analytics E2E; uses the actual application without sending events to Google.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { captureClipboard, copied, expect, pickOption, SLUG, test } from "../e2e/helpers";
import { ANALYTICS_URL_PATTERN } from "./network";

const ORIGIN = "https://imagepromptbook.com";
const SERVER = "http://127.0.0.1:3201";

async function queue(page: Parameters<typeof copied>[0]): Promise<unknown[][]> {
  return page.evaluate(() => ((Reflect.get(window, "dataLayer") ?? []) as IArguments[]).map((entry) => Array.from(entry)));
}

test.beforeEach(async ({ context, page }) => {
  // These origins are browser-only aliases of loopback. No request reaches the live site.
  await context.route(/^https:\/\/(?:imagepromptbook\.com|ipb-analytics-preview\.example)\//, async (route) => {
    const url = new URL(route.request().url());
    const response = await route.fetch({ url: `${SERVER}${url.pathname}${url.search}` });
    await route.fulfill({ response });
  });
  await context.route(ANALYTICS_URL_PATTERN, (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await context.route("https://chatgpt.com/**", (route) => route.fulfill({ status: 200, contentType: "text/html", body: "<title>Handoff stub</title>" }));
  await captureClipboard(page);
});

test.afterEach(async ({ page }, info) => {
  await info.attach("application-tag-queue", { body: JSON.stringify({ url: page.url(), queue: await queue(page) }, null, 2), contentType: "application/json" });
  await info.attach("page-screenshot", { body: await page.screenshot(), contentType: "image/png" });
});

test("localhost and preview origins do not initialize a production tag", async ({ page, analyticsRequests }) => {
  for (const origin of [SERVER, "https://ipb-analytics-preview.example"]) {
    await page.goto(`${origin}/en/prompts/${SLUG}`);
    await expect(page.getByTestId("copy-prompt")).toBeVisible();
    expect(await queue(page)).toEqual([]);
    expect(await page.evaluate(() => typeof Reflect.get(window, "gtag"))).toBe("undefined");
    await page.getByTestId("copy-prompt").click();
    await expect(page.getByRole("status")).toContainText("Prompt copied.");
  }
  expect(analyticsRequests).toEqual([]);
});

test("successful actions record safe identifiers once and preserve attribution", async ({ page, context }, info) => {
  const response = await page.goto(`${ORIGIN}/en?utm_source=github&utm_medium=referral&utm_campaign=avatars`);
  expect(response?.status()).toBe(200);
  expect(new URL(page.url()).searchParams.get("utm_campaign")).toBe("avatars");
  await expect.poll(async () => (await queue(page)).filter((entry) => entry[0] === "config")).toHaveLength(1);
  const configurations = (await queue(page)).filter((entry) => entry[0] === "config");
  expect(configurations[0]?.[1]).toBe("G-9XPFRGZTK3");

  await page.locator(`main h2 a[href="/en/prompts/${SLUG}"]`).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await pickOption(page, "outline", "Thin soft outlines");
  await pickOption(page, "outline", "Thin soft outlines");
  await page.getByTestId("copy-prompt").click();
  await expect(page.getByRole("status")).toContainText("Prompt copied.");
  await page.getByRole("button", { name: "Share link with my settings", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Link copied.");
  const share = (await copied(page)).at(-1)!;
  const [popup] = await Promise.all([context.waitForEvent("page"), page.getByTestId("use-in-chatgpt").click()]);
  await popup.close();

  const events = (await queue(page)).filter((entry) => entry[0] === "event");
  expect(events.map((entry) => entry[1])).toEqual(["change_prompt_option", "copy_prompt", "share_prompt", "open_chatgpt"]);
  expect(events[0]?.[2]).toEqual({ prompt_slug: SLUG, locale: "en", variant: "short", parameter_id: "outline", option_id: "thin" });
  for (const entry of events.slice(1)) {
    expect(entry[2]).toEqual({ prompt_slug: SLUG, locale: "en", variant: "short" });
  }
  expect(JSON.stringify(events)).not.toMatch(/prompt=|p\.outline|link_url|Generate one image/);
  await info.attach("prompt-action-events", { body: JSON.stringify(events, null, 2), contentType: "application/json" });
  await page.goBack();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  expect((await queue(page)).filter((entry) => entry[0] === "config")).toHaveLength(1);
  expect((await queue(page)).filter((entry) => entry[1] === "page_view")).toEqual([]);

  await page.goto(share);
  await expect(page.getByRole("status")).toContainText("Loaded the shared options.");
  expect((await queue(page)).filter((entry) => entry[1] === "change_prompt_option")).toEqual([]);
});

test("failed clipboard and analytics do not invent success or break the UI", async ({ page }) => {
  await page.goto(`${ORIGIN}/en/prompts/${SLUG}`);
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: () => Promise.reject(new Error("Clipboard denied")) } });
  });
  await page.getByTestId("copy-prompt").click();
  await expect(page.getByTestId("manual-copy")).toBeVisible();
  expect((await queue(page)).filter((entry) => entry[1] === "copy_prompt")).toEqual([]);
  await page.getByRole("dialog").getByRole("button", { name: "Close" }).click();
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => Reflect.get(window, "__copied").push(text) } });
    Reflect.set(window, "gtag", () => { throw new Error("Analytics unavailable"); });
  });
  await page.getByTestId("copy-prompt").click();
  await expect(page.getByRole("status")).toContainText("Prompt copied.");
  expect((await copied(page)).at(-1)?.length).toBeGreaterThan(100);
});
