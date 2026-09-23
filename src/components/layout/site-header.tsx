/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 getActiveCategories/getLibrary/getVisibleEntries，依赖同目录 SearchBox/FilterMenu/SortSelect
 * [OUTPUT]: 对外提供 SiteHeader 服务端组件
 * [POS]: components/layout 的顶部导航（参考 jevable.com）：左侧仅图标｜居中合一筛选胶囊（搜索·分类/标签·排序）｜右侧 👋 与提交；窄屏胶囊换到第二行
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { Plus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { getActiveCategories, getLibrary, getVisibleEntries } from "@/lib/content/catalog";
import { AUTHOR_X_URL } from "@/lib/site";
import { FilterMenu } from "./filter-menu";
import { SearchBox } from "./search-box";
import { SortSelect } from "./sort-select";

const circle = "grid size-12 shrink-0 place-items-center rounded-full bg-card shadow-[0_1px_2px_rgba(28,27,25,0.06),0_4px_14px_rgba(28,27,25,0.06)] ring-1 ring-black/[0.04] transition-transform hover:scale-[1.04] active:scale-[0.97]";

export async function SiteHeader({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const categories = getActiveCategories().map((category) => ({ id: category.id, label: category.labels[locale] }));
  const visible = getVisibleEntries();
  const tags = getLibrary()
    .taxonomy.tags.filter((tag) => visible.some((entry) => entry.meta.tags.includes(tag.id)))
    .map((tag) => ({ id: tag.id, label: tag.labels[locale] }));

  return (
    <header className="relative z-30 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70 lg:sticky lg:top-0">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2">
        {t("skip")}
      </a>
      <div className="mx-auto flex max-w-[1800px] flex-wrap items-center gap-3 px-4 py-4 sm:px-6 md:flex-nowrap lg:px-8">
        <Link href="/" aria-label={t("home")} className={circle}>
          <BrandMark />
        </Link>

        <div className="order-3 flex w-full justify-center md:order-none md:flex-1">
          <div className="flex h-12 w-full max-w-xl items-center gap-0.5 rounded-full bg-card p-1 shadow-[0_1px_2px_rgba(28,27,25,0.05),0_6px_20px_rgba(28,27,25,0.06)] ring-1 ring-black/[0.05]">
            <Suspense fallback={<div className="h-10 flex-1" />}>
              <SearchBox className="min-w-0 flex-1" />
              <span aria-hidden className="h-5 w-px shrink-0 bg-border" />
              <FilterMenu categories={categories} tags={tags} />
              <SortSelect />
            </Suspense>
          </div>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2.5 md:ml-0">
          <a href={AUTHOR_X_URL} target="_blank" rel="noopener noreferrer" aria-label={t("hello")} title={t("hello")} className={`${circle} text-[22px]`}>
            <span aria-hidden>👋</span>
          </a>
          <Link href="/contribute" aria-label={t("submit")} title={t("submit")} className={circle}>
            <Plus className="size-5" aria-hidden />
          </Link>
        </div>
      </div>
    </header>
  );
}

/** Two capsule eyes: the first entry's visual signature, readable at icon size. */
function BrandMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-6">
      <rect x="6.5" y="5" width="4" height="11" rx="2" fill="currentColor" transform="rotate(-12 8.5 10.5)" />
      <rect x="13.5" y="5.5" width="4" height="11" rx="2" fill="currentColor" transform="rotate(-12 15.5 11)" />
    </svg>
  );
}
