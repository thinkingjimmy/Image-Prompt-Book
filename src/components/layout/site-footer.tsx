/**
 * [INPUT]: Localized license copy, locale-aware Link and composed page heading/link content.
 * [OUTPUT]: FooterLead for the compact Line heading/link row, and SiteFooter for one license statement.
 * [POS]: Shared content-column ending with 16px bottom/safe-area spacing; navigation lives in the sidebar.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";

export function FooterLead({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <section data-footer-lead className="mt-auto border-t border-border/60">
      <div className="mx-auto grid max-w-[1800px] items-center gap-x-8 px-4 pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-6 lg:px-8">
        <h1 className="text-[15px] leading-snug font-semibold tracking-tight">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  return (
    <footer className="mt-16 border-t border-border/60 [main:has([data-footer-lead])+&]:mt-0 [main:has([data-footer-lead])+&]:border-t-0">
      <div className="mx-auto max-w-[1800px] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[13px] leading-relaxed text-muted-foreground sm:px-6 lg:px-8">
        <p>
          <Link href="/licenses" className="inline-flex min-h-11 items-center rounded-sm py-2 underline decoration-transparent underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground/40">
            {t("footerNote")}
          </Link>
        </p>
      </div>
    </footer>
  );
}
