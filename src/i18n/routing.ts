/**
 * [INPUT]: 依赖 next-intl/routing 的 defineRouting，依赖 ./config 的 LOCALES/DEFAULT_LOCALE
 * [OUTPUT]: 对外提供 routing 配置（显式语言前缀、关闭语言协商）
 * [POS]: i18n 的路由契约，被 navigation.ts 与 request.ts 消费；`/` 的固定跳转由 next.config 的 redirects 完成
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "./config";

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: "always",
  // Same URL, same content for every visitor and crawler: no Accept-Language or cookie negotiation.
  localeDetection: false,
  localeCookie: false,
});
