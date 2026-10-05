/**
 * [INPUT]: Current pathname/search params, localized navigation messages, locale/native-name configuration and shared dropdown primitives.
 * [OUTPUT]: LanguageSwitcher, an icon-only trigger opening native locale links with current-language indication and compact 32px controls with 44px hit areas.
 * [POS]: Shared left-aligned sidebar utilities; full locale navigation retains the path/query and session-stored prompt settings.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Check, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LOCALE_NATIVE_NAMES, LOCALES, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const current = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const params = useSearchParams();
  const rest = pathname.split("/").slice(2).join("/");
  const search = params.toString();
  const href = (locale: string) => `/${locale}${rest ? `/${rest}` : ""}${search ? `?${search}` : ""}`;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        aria-label={t("changeLanguage", { language: LOCALE_NATIVE_NAMES[current] })}
        title={t("language")}
        className="site-control site-icon-control text-foreground/70 data-[state=open]:bg-card data-[state=open]:text-foreground"
      >
        <Languages aria-hidden className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" sideOffset={12} collisionPadding={16} className="flex min-w-48 flex-col gap-3 rounded-lg p-3">
        {LOCALES.map((locale) => {
          const active = locale === current;
          return (
            <DropdownMenuItem key={locale} asChild className={cn("site-control justify-between px-3 py-0 text-[13px] focus:bg-muted focus:text-foreground focus-visible:outline-2 focus-visible:outline-ring", active && "bg-muted")}>
              <a
                href={href(locale)}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? "true" : undefined}
                onClick={active ? (event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setOpen(false);
                } : undefined}
              >
                <span>{LOCALE_NATIVE_NAMES[locale]}</span>
                {active && <Check aria-hidden className="ml-auto size-4" />}
              </a>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
