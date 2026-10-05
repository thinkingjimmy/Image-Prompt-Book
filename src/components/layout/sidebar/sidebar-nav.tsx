/**
 * [INPUT]: Localized links/messages, current pathname, the brand image, LanguageSwitcher and server-provided categories/repository/author URLs.
 * [OUTPUT]: SidebarBrand, SidebarNav (icon-led explore/collections and categories), SidebarActions (X, GitHub, language, text About) and SidebarData.
 * [POS]: Shared Canvas desktop/drawer navigation; compact 32px controls retain non-overlapping 44px hit areas.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import Image from "next/image";
import { Compass, Layers } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "../language-switcher";
import brandMark from "./brand-mark.png";

export type SidebarData = {
  categories: { id: string; label: string; count: number }[];
  hasCollections: boolean;
  repoUrl: string;
  xUrl: string;
};

const ITEM = "site-control w-full";
const item = (active: boolean) =>
  cn(ITEM, active ? "bg-card text-foreground shadow-[0_1px_3px_rgb(0_0_0/0.035)]" : "text-foreground/75");
const ICON =
  "site-control site-icon-control text-foreground/70";

function Section({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      {label && <p className="px-3 pt-5 text-xs text-muted-foreground">{label}</p>}
      {children}
    </div>
  );
}

function GitHubMark() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

function XMark() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className="size-4" fill="currentColor">
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  );
}

export function SidebarBrand({ className }: { className?: string } = {}) {
  const t = useTranslations("nav");
  return (
    <Link href="/" aria-label={t("home")} className={cn("flex min-h-11 min-w-0 items-center gap-2.5 rounded-lg px-1.5 outline-none focus-visible:ring-3 focus-visible:ring-ring/30", className)}>
      <Image src={brandMark} alt="" priority unoptimized className="size-7 shrink-0" />
      <span className="truncate text-[17px] font-semibold tracking-tight">Image Prompt Book</span>
    </Link>
  );
}

export function SidebarNav({ categories, hasCollections }: SidebarData) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const rest = `/${pathname.split("/").slice(2).join("/")}`.replace(/\/$/, "") || "/";
  const is = (path: string) => rest === path;
  const within = (path: string) => rest === path || rest.startsWith(`${path}/`);

  return (
    <nav aria-label={t("sidebar")} className="flex flex-col">
      <Section>
        <Link href="/" aria-current={is("/") ? "page" : undefined} className={item(is("/"))}>
          <Compass aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
          {t("explore")}
        </Link>
        {hasCollections && (
          <Link href="/collections" aria-current={within("/collections") ? "page" : undefined} className={item(within("/collections"))}>
            <Layers aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
            {t("collections")}
          </Link>
        )}
      </Section>

      {categories.length > 0 && (
        <Section label={t("categories")}>
          {categories.map((category) => {
            const active = is(`/categories/${category.id}`);
            return (
              <Link key={category.id} href={`/categories/${category.id}`} aria-current={active ? "page" : undefined} className={item(active)}>
                <span className="min-w-0 flex-1 truncate">{category.label}</span>
                <span className="text-xs font-normal text-muted-foreground tabular-nums">{category.count}</span>
              </Link>
            );
          })}
        </Section>
      )}
    </nav>
  );
}

export function SidebarActions({ repoUrl, xUrl }: Pick<SidebarData, "repoUrl" | "xUrl">) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const about = pathname.endsWith("/about");
  return (
    <div role="group" aria-label={t("siteTools")} className="site-tools flex shrink-0 items-center gap-3">
      <a href={xUrl} target="_blank" rel="noopener noreferrer" aria-label={t("authorX")} title={t("authorX")} className={ICON}>
        <XMark />
      </a>
      <a href={repoUrl} target="_blank" rel="noopener noreferrer" aria-label={t("github")} title={t("github")} className={ICON}>
        <GitHubMark />
      </a>
      <Suspense fallback={<div className="size-8 shrink-0" />}>
        <LanguageSwitcher />
      </Suspense>
      <Link href="/about" aria-current={about ? "page" : undefined} className="site-control shrink-0 text-foreground/70">
        {t("about")}
      </Link>
    </div>
  );
}
