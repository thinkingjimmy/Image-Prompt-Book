/**
 * [INPUT]: Native links, localized messages, canonical list URLs and the compact TagMenu.
 * [OUTPUT]: ListToolbar with quiet Featured/Latest links and one filter dropdown, Pagination and EmptyState.
 * [POS]: Gallery refinement above the grid; tag links remain available in plain HTML without JavaScript.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { MAX_TAGS, type ListQuery, type SortOrder } from "@/lib/content/query";
import { listHref } from "@/lib/seo/urls";
import { cn } from "@/lib/utils";
import { TagMenu } from "./tag-menu";

type ListToolbarProps = {
  locale: Locale;
  tags: { id: string; label: string }[];
  query: ListQuery;
  category?: string;
  total: number;
};

export async function ListToolbar({ locale, tags, query, category, total }: ListToolbarProps) {
  const t = await getTranslations({ locale, namespace: "gallery" });
  const nav = await getTranslations({ locale, namespace: "nav" });
  const href = (next: Partial<ListQuery>) => listHref(locale, { ...query, page: 1, ...next }, category);
  const options = tags.map((tag) => {
    const checked = query.tags.includes(tag.id);
    const selected = checked ? query.tags.filter((id) => id !== tag.id) : [...query.tags, tag.id];
    return {
      ...tag,
      checked,
      disabled: !checked && query.tags.length >= MAX_TAGS,
      href: href({ tags: tags.map((item) => item.id).filter((id) => selected.includes(id)) }),
    };
  });
  const filtered = Boolean(query.q || query.tags.length);

  return (
    <div className="mb-5 flex flex-col gap-2.5">
      <div className="flex min-h-11 items-center justify-between gap-6">
        <nav aria-label={nav("sort")} className="flex shrink-0 items-center gap-4 sm:gap-5">
          {(["featured", "latest"] as SortOrder[]).map((sort) => (
            <Link
              key={sort}
              href={href({ sort })}
              scroll={false}
              rel={sort === "latest" ? "nofollow" : undefined}
              aria-current={query.sort === sort ? "true" : undefined}
              className={cn("inline-flex h-11 min-w-12 items-center pr-3 text-sm font-semibold transition-colors sm:min-w-[52px] sm:text-[15px]", query.sort === sort ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
            >
              <span className={cn("relative flex h-full items-center", query.sort === sort && "after:absolute after:right-0 after:bottom-1 after:left-0 after:h-0.5 after:rounded-lg after:bg-current")}>
                {nav(sort)}
              </span>
            </Link>
          ))}
        </nav>
        <div role="group" aria-label={t("tags")}>
          <TagMenu options={options} count={query.tags.length} allHref={href({ tags: [] })} />
        </div>
      </div>
      <noscript>
        <nav aria-label={t("filterLabel")} className="flex flex-wrap gap-3">
          <Link href={href({ tags: [] })} className="inline-flex min-h-11 items-center px-3">{t("allTags")}</Link>
          {options.filter((option) => !option.disabled).map((option) => (
            <Link key={option.id} href={option.href} rel="nofollow" aria-current={option.checked ? "true" : undefined} className="inline-flex min-h-11 items-center rounded-lg bg-muted px-3 text-[13px]">{option.label}</Link>
          ))}
        </nav>
      </noscript>
      {filtered && (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          {t("results", { count: total })}{" · "}
          <Link href={listHref(locale, { sort: query.sort }, category)} scroll={false} className="font-medium text-foreground underline-offset-4 hover:underline">{t("clearFilters")}</Link>
        </p>
      )}
    </div>
  );
}

export async function Pagination({ locale, query, category, totalPages }: { locale: Locale; query: ListQuery; category?: string; totalPages: number }) {
  if (totalPages <= 1) return null;
  const t = await getTranslations({ locale, namespace: "gallery" });
  const page = query.page;
  const item = "inline-flex h-10 items-center gap-1 rounded-full border border-border bg-card px-4 text-sm font-medium transition-colors hover:border-foreground/30";
  const disabled = "inline-flex h-10 items-center gap-1 rounded-full px-4 text-sm text-muted-foreground/60";
  return (
    <nav aria-label={t("pagination")} className="mt-6 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link rel="prev" href={listHref(locale, { ...query, page: page - 1 }, category)} className={item}>
          <ChevronLeft className="size-4" aria-hidden />
          {t("previous")}
        </Link>
      ) : (
        <span aria-disabled className={disabled}>
          <ChevronLeft className="size-4" aria-hidden />
          {t("previous")}
        </span>
      )}
      <span className="text-sm text-muted-foreground tabular-nums" aria-current="page">
        {t("pageOf", { page, total: totalPages })}
      </span>
      {page < totalPages ? (
        <Link rel="next" href={listHref(locale, { ...query, page: page + 1 }, category)} className={item}>
          {t("next")}
          <ChevronRight className="size-4" aria-hidden />
        </Link>
      ) : (
        <span aria-disabled className={disabled}>
          {t("next")}
          <ChevronRight className="size-4" aria-hidden />
        </span>
      )}
    </nav>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: { label: string; href: string } }) {
  return (
    <div className="mx-auto my-16 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-dashed border-border px-6 py-12 text-center">
      <h2 className="text-base font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground">{body}</p>
      {action && (
        <Link href={action.href} className="mt-3 inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">
          {action.label}
        </Link>
      )}
    </div>
  );
}
