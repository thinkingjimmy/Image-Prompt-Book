/**
 * [INPUT]: 无外部依赖
 * [OUTPUT]: 对外提供 LOCALES、DEFAULT_LOCALE、Locale 类型、isLocale()、LOCALE_NATIVE_NAMES
 * [POS]: i18n 的纯常量层，被 routing/request、lib/content 与客户端组件共享，避免纯逻辑依赖 next-intl
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
export const LOCALES = ["en", "zh-CN"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Native names are shown in the switcher so each option is readable to its own speakers. */
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  "zh-CN": "简体中文",
};
