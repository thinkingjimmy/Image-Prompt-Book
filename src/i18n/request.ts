/**
 * [INPUT]: 依赖 next-intl/server 的 getRequestConfig，依赖 ./config 的 isLocale，依赖 messages/*.json
 * [OUTPUT]: 默认导出每请求的 locale 与消息
 * [POS]: i18n 的服务端配置入口，由 next.config 中的 next-intl 插件注册
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getRequestConfig } from "next-intl/server";
import { DEFAULT_LOCALE, isLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = isLocale(requested) ? requested : DEFAULT_LOCALE;
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    timeZone: "UTC",
  };
});
