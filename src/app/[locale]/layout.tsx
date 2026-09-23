/**
 * [INPUT]: 依赖 next-intl 的 NextIntlClientProvider/setRequestLocale，依赖 @/i18n 的 routing/LOCALES，依赖 @/components/layout 的 SiteHeader/SiteFooter，依赖 @/components/ui/scroll-area 的 PageScrollbar
 * [OUTPUT]: 默认导出根布局（<html lang>、js 标记、全站导航与页脚、自研整页滚动条），generateStaticParams
 * [POS]: app 的根布局位于 [locale] 下，使 lang 随语言变化；未知语言在此返回 404
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import "../globals.css";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { PageScrollbar } from "@/components/ui/scroll-area";
import { isLocale, LOCALES } from "@/i18n/config";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#f7f6f3",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        {/* Marks JS availability before paint: without it every prompt view stays visible and readable. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      {/* Column layout: main grows, so the footer stays at the bottom even when there is little content. */}
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider>
          <SiteHeader locale={locale} />
          <main id="main" tabIndex={-1} className="flex-1 outline-none">
            {children}
          </main>
          <SiteFooter locale={locale} />
          <PageScrollbar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
