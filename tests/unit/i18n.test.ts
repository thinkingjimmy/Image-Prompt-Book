/**
 * [INPUT]: 依赖 src/i18n/messages/*.json，依赖 @/i18n/config 的 LOCALES，依赖 @/components/pages/static-copy
 * [OUTPUT]: 国际化完整性测试：各语言消息键完全一致且非空、ICU 占位符一致、说明页双语结构一致（AC-12，IPB-046）
 * [POS]: tests/unit 的文案闸门；缺失翻译在 CI 失败，而不是在运行时回退到英文
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { STATIC_COPY } from "@/components/pages/static-copy";
import { LOCALES } from "@/i18n/config";

type Tree = { [key: string]: string | Tree };
const load = (locale: string) => JSON.parse(readFileSync(`src/i18n/messages/${locale}.json`, "utf8")) as Tree;

function flatten(tree: Tree, prefix = ""): Record<string, string> {
  return Object.fromEntries(
    Object.entries(tree).flatMap(([key, value]) => (typeof value === "string" ? [[`${prefix}${key}`, value]] : Object.entries(flatten(value, `${prefix}${key}.`)))),
  );
}

/** Top-level ICU arguments only; branch bodies such as `other {Original}` sit one level deeper. */
function placeholders(text: string): string[] {
  const names: string[] = [];
  let depth = 0;
  for (let index = 0; index < text.length; index++) {
    if (text[index] === "{") {
      if (depth === 0) names.push(text.slice(index + 1).match(/^\w+/)?.[0] ?? "");
      depth++;
    } else if (text[index] === "}") depth--;
  }
  return names.sort();
}

describe("UI messages", () => {
  const [base, ...others] = LOCALES.map((locale) => ({ locale, messages: flatten(load(locale)) }));

  it.each(others)("$locale has exactly the same keys as en", ({ messages }) => {
    expect(Object.keys(messages).sort()).toEqual(Object.keys(base!.messages).sort());
  });

  it.each(LOCALES)("%s has no empty strings", (locale) => {
    for (const [key, value] of Object.entries(flatten(load(locale)))) expect(value.trim(), key).not.toBe("");
  });

  it.each(others)("$locale uses the same ICU placeholders as en", ({ messages }) => {
    for (const [key, value] of Object.entries(base!.messages)) expect(placeholders(messages[key]!), key).toEqual(placeholders(value));
  });
});

describe("static pages", () => {
  it("every page has the same section structure in every locale", () => {
    for (const [page, copy] of Object.entries(STATIC_COPY)) {
      // README links point at each locale's own README, so compare them without file and anchor.
      const target = (href: string) => href.replace(/README(\.[\w-]+)?\.md#.*$/, "README");
      const shape = (locale: (typeof LOCALES)[number]) =>
        copy[locale].sections.map((section) => [section.paragraphs?.length ?? 0, section.items?.length ?? 0, section.links?.map((link) => target(link.href)) ?? []]);
      for (const locale of LOCALES) expect(shape(locale), `${page}/${locale}`).toEqual(shape("en"));
    }
  });
});
