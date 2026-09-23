/**
 * [INPUT]: 依赖 next/navigation 的 notFound，依赖 ./config 的 isLocale
 * [OUTPUT]: 对外提供 requireLocale()：把路由参数收窄为 Locale，不支持的语言直接 404
 * [POS]: i18n 的服务端参数守卫，被每个页面与 generateMetadata 首行调用，保证未知语言不会进入内容读取
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

export async function requireLocale(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
