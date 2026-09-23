/**
 * [INPUT]: 依赖 @/components/ui/dropdown-menu，依赖 next/navigation 的 usePathname/useSearchParams，依赖 @/i18n/config 的 LOCALES/LOCALE_NATIVE_NAMES
 * [OUTPUT]: 对外提供 LanguageSwitcher（页脚语言下拉，保留同一路径、slug 与列表参数的真实链接）
 * [POS]: components/layout 的界面语言切换；整页导航使 <html lang> 与独立详情以新语言重新呈现，草稿由 sessionStorage 延续
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Check, ChevronDown, Globe } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { isLocale, LOCALE_NATIVE_NAMES, LOCALES } from "@/i18n/config";

export function LanguageSwitcher() {
  const t = useTranslations("nav");
  const current = useLocale();
  const pathname = usePathname();
  const params = useSearchParams();
  const rest = pathname.split("/").slice(2).join("/");
  const search = params.toString();
  const href = (locale: string) => `/${locale}${rest ? `/${rest}` : ""}${search ? `?${search}` : ""}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("language")}
        className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-3.5 text-sm font-medium outline-none transition-colors hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/30"
      >
        <Globe aria-hidden className="size-4 text-muted-foreground" />
        {isLocale(current) ? LOCALE_NATIVE_NAMES[current] : current}
        <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="end" sideOffset={8} className="w-44 rounded-2xl p-1.5">
        {LOCALES.map((locale) => (
          <DropdownMenuItem key={locale} asChild className="rounded-lg">
            <a href={href(locale)} hrefLang={locale} lang={locale} aria-current={locale === current ? "true" : undefined}>
              <span className="flex-1">{LOCALE_NATIVE_NAMES[locale]}</span>
              {locale === current && <Check aria-hidden className="size-4" />}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
