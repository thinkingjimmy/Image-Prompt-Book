/**
 * [INPUT]: 依赖 @playwright/test 的 Page，依赖 @/lib 的内容加载与 composePrompt（计算期望文本）
 * [OUTPUT]: 对外提供 test（goto 后等待网络空闲）/expect/SLUG/FIXTURE_CONTENT、captureClipboard()/denyClipboard()/breakSessionStorage()/copied()/expectedPrompt()/pickOption()/copyPrompt()
 * [POS]: tests/e2e 的共享工具；剪贴板与存储以注入脚本模拟，跨浏览器稳定且不依赖系统权限
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import { test as base, expect, type Page } from "@playwright/test";
import type { Locale } from "@/i18n/config";
import { loadContentLibrary } from "@/lib/content/load";
import { composePrompt, defaultSelections, type Selections } from "@/lib/prompt/template";

export const SLUG = "grokbot-capsule-icon";

/** `page.goto` also waits for the network to settle, so interactions never race hydration. */
export const test = base.extend({
  page: async ({ page }, provide) => {
    const goto = page.goto.bind(page);
    page.goto = async (url, options) => {
      const response = await goto(url, options);
      await page.waitForLoadState("networkidle");
      return response;
    };
    await provide(page);
  },
});
export { expect };
export const FIXTURE_CONTENT = path.resolve("tests/fixtures/.generated/content");

const library = loadContentLibrary({ root: FIXTURE_CONTENT, mediaRoot: path.join(FIXTURE_CONTENT, "public"), allowFixtures: true });
export const grokbot = library.entries.find((entry) => entry.meta.slug === SLUG)!;

export function expectedPrompt(selections: Partial<Selections>, outputLocale: Locale, variantId = "short"): string {
  const variant = grokbot.variants.find((item) => item.id === variantId)!;
  return composePrompt({ record: variant, selections: { ...defaultSelections(variant.parameters), ...selections }, outputLocale });
}

export async function captureClipboard(page: Page) {
  await page.addInitScript(() => {
    const store: string[] = [];
    Object.defineProperty(window, "__copied", { value: store });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (text: string) => void store.push(text) } });
  });
}

export async function denyClipboard(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: () => Promise.reject(new DOMException("Write permission denied.", "NotAllowedError")) },
    });
  });
}

export async function breakSessionStorage(page: Page) {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
}

export async function copied(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __copied: string[] }).__copied);
}

/** Opens a parameter's select (by stable parameter ID) and chooses an option by its visible label. */
export async function pickOption(page: Page, parameterId: string, optionLabel: string) {
  const scope = page.getByRole("dialog").or(page.locator("main")).first();
  await scope.locator(`[data-parameter="${parameterId}"]`).click();
  await page.getByRole("option", { name: optionLabel, exact: true }).click();
  await expect(page.getByRole("listbox")).toHaveCount(0);
}

/** Copies the current prompt through the UI and returns exactly what reached the clipboard. */
export async function copyPrompt(page: Page): Promise<string> {
  const before = (await copied(page)).length;
  await page.getByTestId("copy-prompt").click();
  await expect.poll(async () => (await copied(page)).length).toBe(before + 1);
  return (await copied(page)).at(-1)!;
}
