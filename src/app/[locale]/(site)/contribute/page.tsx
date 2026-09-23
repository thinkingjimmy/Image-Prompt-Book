/**
 * [INPUT]: 依赖 @/components/pages/static-page 的 StaticPageView/staticPageMetadata
 * [OUTPUT]: 默认导出 contribute 说明页，generateMetadata
 * [POS]: app/[locale]/(site) 的 /contribute 路由，内容来自 static-copy 的双语正文
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { StaticPageView, staticPageMetadata } from "@/components/pages/static-page";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return staticPageMetadata("contribute", await requireLocale(params));
}

export default async function ContributePage({ params }: Props) {
  const locale = await requireLocale(params);
  setRequestLocale(locale);
  return <StaticPageView page="contribute" locale={locale} />;
}
