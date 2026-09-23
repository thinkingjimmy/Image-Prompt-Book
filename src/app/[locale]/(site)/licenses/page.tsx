/**
 * [INPUT]: 依赖 @/components/pages/static-page 的 StaticPageView/staticPageMetadata
 * [OUTPUT]: 默认导出 licenses 说明页，generateMetadata
 * [POS]: app/[locale]/(site) 的 /licenses 路由，内容来自 static-copy 的双语正文
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { StaticPageView, staticPageMetadata } from "@/components/pages/static-page";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return staticPageMetadata("licenses", await requireLocale(params));
}

export default async function LicensesPage({ params }: Props) {
  const locale = await requireLocale(params);
  setRequestLocale(locale);
  return <StaticPageView page="licenses" locale={locale} />;
}
