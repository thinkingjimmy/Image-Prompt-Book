/**
 * [INPUT]: 依赖 next/link，依赖 @/lib/seo/urls 的 listHref，依赖 @/lib/content/query 的 ListQuery
 * [OUTPUT]: 对外提供 TagFilters（仅在筛选生效时显示可移除的搜索词/标签）、Pagination、EmptyState 服务端组件
 * [POS]: components/gallery 的列表控件；全部为可抓取的真实链接（标签 AND 切换、上一页/下一页），无 JS 亦可用
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import type { ListQuery } from "@/lib/content/query";
import { listHref } from "@/lib/seo/urls";

type TagFiltersProps = {
  locale: Locale;
  tags: { id: string; label: string }[];
  query: ListQuery;
  category?: string;
  total: number;
};

/** Shown only while filters apply: the active search and tags as removable chips, plus the result count. */
export async function TagFilters({ locale, tags, query, category, total }: TagFiltersProps) {
  const t = await getTranslations({ locale, namespace: "gallery" });
  const without = (id: string) => listHref(locale, { ...query, tags: query.tags.filter((tag) => tag !== id), page: 1 }, category);
  const chip = "inline-flex h-8 items-center gap-1 rounded-full border border-param-border bg-param px-3 text-[13px] font-medium text-param-foreground transition-colors hover:border-ring/60";

  return (
    <div role="group" aria-label={t("tags")} className="mb-5 flex flex-wrap items-center gap-2">
      {query.q && (
        <Link href={listHref(locale, { ...query, q: "", page: 1 }, category)} scroll={false} className={chip} aria-label={t("removeSearch", { q: query.q })}>
          “{query.q}”
          <X className="size-3.5" aria-hidden />
        </Link>
      )}
      {tags
        .filter((tag) => query.tags.includes(tag.id))
        .map((tag) => (
          <Link key={tag.id} href={without(tag.id)} scroll={false} className={chip} aria-label={t("removeTag", { tag: tag.label })}>
            {tag.label}
            <X className="size-3.5" aria-hidden />
          </Link>
        ))}
      <p className="text-[13px] text-muted-foreground" aria-live="polite">
        {t("results", { count: total })}
        {" · "}
        <Link href={listHref(locale, { sort: query.sort }, category)} scroll={false} className="font-medium text-foreground underline-offset-4 hover:underline">
          {t("clearFilters")}
        </Link>
      </p>
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
