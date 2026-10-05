/**
 * [INPUT]: Global styles, next/font/google Geist, next-intl locale/provider, locale configuration and shared sidebar/header/footer/scrollbar/analytics components.
 * [OUTPUT]: LocaleLayout and generateStaticParams; localized HTML with the Geist font variable, inset Canvas shell and Line footer placement and production analytics.
 * [POS]: App Router root under [locale]; sets the document language and rejects unsupported locales.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import "../globals.css";
import type { Viewport } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { Analytics } from "@/components/layout/analytics";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/header/site-header";
import { SiteSidebar } from "@/components/layout/sidebar/site-sidebar";
import { PageScrollbar } from "@/components/ui/scroll-area";
import { isLocale, LOCALES } from "@/i18n/config";

const geist = Geist({ subsets: ["latin"], display: "swap", variable: "--font-geist" });

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: "#efeee8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function LocaleLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} className={geist.variable} suppressHydrationWarning>
      <head>
        {/* Marks JS availability before paint: without it every prompt view stays visible and readable. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body className="min-h-dvh">
        <NextIntlClientProvider>
          <SiteSidebar locale={locale} />
          <div className="site-canvas">
            <SiteHeader locale={locale} />
            {/* A footer lead (the gallery heading) is pinned to the bottom of main, so it always sits against the footer. */}
            <main id="main" tabIndex={-1} className="flex-1 outline-none has-[>[data-footer-lead]]:flex has-[>[data-footer-lead]]:flex-col">
              {children}
            </main>
            <SiteFooter locale={locale} />
          </div>
          <PageScrollbar />
        </NextIntlClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
