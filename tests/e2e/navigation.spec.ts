/**
 * [INPUT]: Shared hydrated browser fixtures, desktop/mobile navigation access, filesystem evidence and axe accessibility checks.
 * [OUTPUT]: Bilingual text/About navigation and public acknowledgements, language-menu keyboard/touch/runtime checks, compact left-aligned X/GitHub/language/About utilities, footer and removed-submission E2E evidence.
 * [POS]: Focused site-shell acceptance; runtime checks also support an existing local server with real content.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { expect, languageMenu, navigationRoot, test } from "./helpers";

const COPY = {
  en: { navigation: "Site navigation", tools: "Site tools", about: "About", authorX: "Jimmy on X", x: "hellojimmywong", tags: "Tags", sort: "Sort" },
  "zh-CN": { navigation: "站点导航", tools: "站点工具", about: "关于", authorX: "Jimmy 的 X", x: "thinkingjimmy", tags: "标签", sort: "排序" },
};

test("navigation runtime loads and switches locales without browser errors @smoke", async ({ page }, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  const visits: { locale: string; url: string; screenshot: string }[] = [];

  try {
    const response = await page.goto("/en");
    expect(response?.status()).toBe(200);
    for (const locale of ["en", "zh-CN", "en"] as const) {
      const copy = COPY[locale];
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.getByRole("main").getByRole("group", { name: copy.tags })).toBeVisible();
      const root = await navigationRoot(page);
      const tools = root.getByRole("group", { name: copy.tools });
      await expect(tools).toBeVisible();
      const drawer = page.getByRole("dialog");
      if (await drawer.isVisible()) {
        const closeLabel = locale === "en" ? "Close navigation" : "关闭导航";
        await expect(drawer.getByRole("button", { name: closeLabel, exact: true })).toBeVisible();
      }
      const screenshot = info.outputPath(`runtime-${visits.length}-${locale}.png`);
      await page.screenshot({ path: screenshot });
      visits.push({ locale, url: page.url(), screenshot });
      if (visits.length < 3) {
        const language = await languageMenu(page);
        await language.getByRole("menuitem", { name: locale === "en" ? "简体中文" : "English", exact: true }).click();
        await expect(page).toHaveURL(new RegExp(`/${locale === "en" ? "zh-CN" : "en"}$`));
        await page.waitForLoadState("networkidle");
      } else if (await drawer.isVisible()) {
        await drawer.getByRole("button", { name: "Close navigation", exact: true }).click();
        await expect(drawer).toHaveCount(0);
      }
    }
    expect(errors).toEqual([]);
  } finally {
    const evidence = info.outputPath("runtime-evidence.json");
    await writeFile(evidence, JSON.stringify({ visits, errors }, null, 2));
    await info.attach("runtime-evidence", { path: evidence, contentType: "application/json" });
  }
});

for (const [locale, copy] of Object.entries(COPY)) {
  test(`${locale} navigation keeps browsing and site tools in distinct places @smoke`, async ({ page }, info) => {
    await page.goto(`/${locale}`);
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("searchbox")).toHaveCount(0);
    await expect(banner.getByRole("button", { name: /Search prompts|搜索 Prompt/, exact: true })).toBeVisible();
    await expect(banner.getByRole("group", { name: copy.tags })).toHaveCount(0);
    await expect(banner.getByRole("navigation", { name: copy.sort })).toHaveCount(0);
    await expect(page.getByRole("main").getByRole("group", { name: copy.tags })).toHaveCount(1);
    await expect(page.getByRole("main").getByRole("navigation", { name: copy.sort })).toHaveCount(1);

    const root = await navigationRoot(page);
    const navigation = root.getByRole("navigation", { name: copy.navigation });
    await expect(navigation.locator('a[href$="/collections"]')).toHaveCount(1);
    await expect(navigation.getByRole("group", { name: copy.tags })).toHaveCount(0);
    await expect(navigation.getByRole("navigation", { name: copy.sort })).toHaveCount(0);
    const tools = root.getByRole("group", { name: copy.tools });
    await expect(tools.getByRole("link")).toHaveCount(3);
    await expect(tools.getByRole("button", { name: /Change language|切换语言/ })).toBeVisible();
    await expect(navigation.getByRole("link", { name: copy.about, exact: true })).toHaveCount(0);
    await expect(tools.getByRole("link", { name: copy.about, exact: true })).toHaveAttribute("href", `/${locale}/about`);
    const labels = await tools.locator("a, button").evaluateAll((items) => items.map((item) => item.getAttribute("aria-label") ?? item.textContent?.trim()));
    expect(labels).toEqual([copy.authorX, "GitHub", expect.stringMatching(/Change language|切换语言/), copy.about]);
    await expect(tools.getByRole("link", { name: "GitHub", exact: true })).toHaveAttribute("href", "https://github.com/thinkingjimmy/Image-Prompt-Book");
    await expect(tools.getByRole("link", { name: copy.authorX })).toHaveAttribute("href", `https://x.com/${copy.x}`);
    await expect(tools.getByRole("link", { name: copy.authorX }).locator("svg")).toHaveCount(1);
    await expect(tools).not.toContainText("👋");
    await expect(page.locator('a[href*="/contribute"], a[href*="source-lead.yml"]')).toHaveCount(0);

    for (const control of await tools.locator("a, button").all()) {
      const box = (await control.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(32);
      expect(box.height).toBe(32);
      expect(await control.evaluate((node) => {
        const r = node.getBoundingClientRect();
        return [r.top - 5, r.bottom + 5].every((y) => node.contains(document.elementFromPoint(r.left + r.width / 2, y)));
      })).toBe(true);
      await expect(control).toBeInViewport();
    }
    const result = await new AxeBuilder({ page }).include('aside, [role="dialog"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(result.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(", ")}`)).toEqual([]);
    const screenshot = info.outputPath("site-navigation.png");
    await page.screenshot({ path: screenshot });
    await info.attach("site-navigation", { path: screenshot, contentType: "image/png" });
    await info.attach("navigation-evidence", {
      body: JSON.stringify({ locale, url: page.url(), links: await tools.getByRole("link").evaluateAll((links) => links.map((link) => ({ label: link.getAttribute("aria-label"), href: link.getAttribute("href") }))) }, null, 2),
      contentType: "application/json",
    });
  });
}

test("navigation language menu preserves category, search, tags and sort @smoke", async ({ page }) => {
  await page.goto("/en/categories/illustration?q=fixture&tags=watercolor&sort=latest");
  const language = await languageMenu(page);
  await expect(language.getByRole("menuitem", { name: "English", exact: true })).toHaveAttribute("aria-current", "true");
  await language.getByRole("menuitem", { name: "简体中文", exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/categories\/illustration\?q=fixture&tags=watercolor&sort=latest$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("searchbox")).toHaveValue("fixture");
  await expect(page.getByRole("navigation", { name: "排序" }).getByRole("link", { name: "最新" })).toHaveAttribute("aria-current", "true");
});

test("navigation language menu supports keyboard selection and Escape focus @smoke", async ({ page, isMobile }, info) => {
  await page.goto("/en");
  const root = await navigationRoot(page);
  const trigger = root.getByRole("button", { name: "Change language, current language: English", exact: true });
  await trigger.focus();
  await trigger.press("Enter");
  const menu = page.getByRole("menu", { name: "Change language, current language: English", exact: true });
  await expect(menu).toBeVisible();
  const current = menu.getByRole("menuitem", { name: "English", exact: true });
  await expect(current).toHaveAttribute("aria-current", "true");
  await expect(menu.getByRole("menuitem", { name: "简体中文", exact: true })).toHaveAttribute("href", "/zh-CN");
  for (const option of await menu.getByRole("menuitem").all()) {
    expect((await option.boundingBox())!.height).toBe(32);
    await expect(option).toBeInViewport();
  }
  const result = await new AxeBuilder({ page }).include('aside, [role="dialog"], [role="menu"]').withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
  expect(result.violations.map((violation) => violation.id)).toEqual([]);
  const screenshot = info.outputPath("language-menu.png");
  await page.screenshot({ path: screenshot });
  await info.attach("language-menu", { path: screenshot, contentType: "image/png" });

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  if (isMobile) await expect(root).toBeVisible();
  let navigations = 0;
  page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) navigations += 1; });
  await trigger.press("ArrowDown");
  await expect(current).toBeFocused();
  await current.press("Enter");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
  expect(navigations).toBe(0);
  const currentLanguageReloads = navigations;
  if (isMobile) await expect(root).toBeVisible();

  await trigger.press("ArrowDown");
  await page.keyboard.press("End");
  await expect(menu.getByRole("menuitem", { name: "简体中文", exact: true })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/zh-CN$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await info.attach("language-menu-evidence", { body: JSON.stringify({ isMobile, url: page.url(), currentLanguageReloads }), contentType: "application/json" });
});

test("navigation utilities work by keyboard and About links public acknowledgements @smoke", async ({ page }, info) => {
  await page.goto("/en");
  const root = await navigationRoot(page);
  const about = root.getByRole("link", { name: "About", exact: true });
  await about.focus();
  await about.press("Enter");
  await expect(page).toHaveURL(/\/en\/about$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("About Image Prompt Book");
  const tools = (await navigationRoot(page)).getByRole("group", { name: "Site tools" });
  await expect(tools.getByRole("link", { name: "About", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('a[href*="source-lead.yml"], a[href*="/contribute"]')).toHaveCount(0);
  if (await page.getByRole("dialog").isVisible()) {
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
  const visits: { locale: string; href: string; screenshot: string }[] = [];
  for (const locale of ["en", "zh-CN"]) {
    if (locale !== "en") await page.goto(`/${locale}/about`);
    const link = page.getByRole("main").getByRole("link", { name: locale === "en" ? "Acknowledgements" : "查看致谢名单", exact: true });
    const href = "https://github.com/thinkingjimmy/Image-Prompt-Book/blob/main/content/ACKNOWLEDGEMENTS.md";
    await expect(link).toHaveAttribute("href", href);
    await link.scrollIntoViewIfNeeded();
    const screenshot = info.outputPath(`about-${locale}.png`);
    await page.screenshot({ path: screenshot });
    visits.push({ locale, href, screenshot });
  }
  const evidence = info.outputPath("acknowledgements-evidence.json");
  await writeFile(evidence, JSON.stringify({ visits }, null, 2));
  await info.attach("acknowledgements-evidence", { path: evidence, contentType: "application/json" });
});

test("navigation footer is a single license link and retired contribution routes return 404", async ({ page, request }, info) => {
  await page.goto("/en");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link")).toHaveCount(1);
  await expect(footer.getByRole("link")).toHaveAttribute("href", "/en/licenses");
  await expect(footer.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByRole("banner")).not.toContainText("Find an effect you like");
  await footer.scrollIntoViewIfNeeded();
  const screenshot = info.outputPath("footer.png");
  await page.screenshot({ path: screenshot });
  await info.attach("footer", { path: screenshot, contentType: "image/png" });
  for (const locale of ["en", "zh-CN"]) expect((await request.get(`/${locale}/contribute`)).status()).toBe(404);
  expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/contribute");
});

test("mobile navigation closes after choosing a category and restores focus on Escape @mobile", async ({ page, isMobile }, info) => {
  test.skip(!isMobile, "touch viewport only");
  await page.goto("/en");
  const drawer = await navigationRoot(page);
  await drawer.getByRole("link", { name: /^Illustration/ }).click();
  await expect(page).toHaveURL(/\/en\/categories\/illustration$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  const reopened = await navigationRoot(page);
  await expect(reopened.getByRole("link", { name: /^Illustration/ })).toHaveAttribute("aria-current", "page");
  await page.screenshot({ path: info.outputPath("mobile-navigation.png") });
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open navigation" })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});
