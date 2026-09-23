/**
 * [INPUT]: 依赖 @/components/ui/dropdown-menu，依赖 next/navigation 的路由与查询参数，依赖 @/i18n/navigation 的 Link
 * [OUTPUT]: 对外提供 FilterMenu（分类单选 + 标签多选 AND 的合一筛选下拉；手机上另含排序）与 isListingPath()
 * [POS]: components/layout/header 的筛选入口，嵌在顶部筛选胶囊中；分类走路由（push），标签按词表顺序写入 `tags` 并重置页码
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/i18n/navigation";
import { MAX_TAGS } from "@/lib/content/query";
import { cn } from "@/lib/utils";

type Term = { id: string; label: string };

export function isListingPath(pathname: string): boolean {
  return /^\/[^/]+(\/categories\/[^/]+)?\/?$/.test(pathname);
}

export function FilterMenu({ categories, tags }: { categories: Term[]; tags: Term[] }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const onListing = isListingPath(pathname);
  const locale = pathname.split("/")[1] ?? "";
  const active = pathname.match(/\/categories\/([^/]+)/)?.[1] ?? "";
  const activeTags = onListing ? (params.get("tags") ?? "").split(",").filter(Boolean) : [];
  const category = categories.find((item) => item.id === active);
  const label = category?.label ?? t("allCategories");

  // Filters carry over between listings only; the page always resets.
  const carried = new URLSearchParams(onListing ? params.toString() : "");
  carried.delete("page");
  const query = Object.fromEntries(carried);

  const sort = onListing && params.get("sort") === "latest" ? "latest" : "featured";
  function setSort(value: "featured" | "latest") {
    const search = new URLSearchParams(carried);
    if (value === "featured") search.delete("sort");
    else search.set("sort", value);
    const base = onListing ? pathname.replace(/\/$/, "") : `/${locale}`;
    const text = search.toString();
    startTransition(() => router.push(`${base}${text ? `?${text}` : ""}`, { scroll: false }));
  }

  function toggleTag(id: string) {
    const next = activeTags.includes(id) ? activeTags.filter((tag) => tag !== id) : [...activeTags, id];
    const search = new URLSearchParams(carried);
    const ordered = tags.map((tag) => tag.id).filter((tag) => next.includes(tag));
    if (ordered.length) search.set("tags", ordered.join(","));
    else search.delete("tags");
    const base = onListing ? pathname.replace(/\/$/, "") : `/${locale}`;
    const text = search.toString();
    startTransition(() => router.push(`${base}${text ? `?${text}` : ""}`, { scroll: false }));
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={t("filter")}
        className={cn(
          "relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-[15px] font-medium sm:px-3.5 text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 data-[state=open]:bg-muted",
          pending && "opacity-70",
        )}
      >
        <SlidersHorizontal aria-hidden className="size-[18px] sm:hidden" />
        <span className="hidden max-w-[9rem] truncate sm:inline">{label}</span>
        {activeTags.length > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-foreground px-1 text-[11px] font-semibold text-background tabular-nums max-sm:absolute max-sm:-top-0.5 max-sm:-right-0.5 max-sm:h-4 max-sm:min-w-4 max-sm:text-[10px]">
            {activeTags.length}
          </span>
        )}
        <ChevronDown aria-hidden className="hidden size-4 text-muted-foreground sm:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={8} className="max-h-[min(28rem,var(--radix-dropdown-menu-content-available-height))] w-60 rounded-2xl p-1.5">
        <DropdownMenuLabel className="text-xs text-muted-foreground">{t("category")}</DropdownMenuLabel>
        {[{ id: "", label: t("allCategories") }, ...categories].map((item) => (
          <DropdownMenuItem key={item.id || "all"} asChild className="cursor-pointer rounded-lg">
            <Link href={{ pathname: item.id ? `/categories/${item.id}` : "/", query }} aria-current={onListing && active === item.id ? "page" : undefined}>
              <span className="flex-1">{item.label}</span>
              {onListing && active === item.id && <Check aria-hidden className="size-4" />}
            </Link>
          </DropdownMenuItem>
        ))}
        {tags.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">{t("tags")}</DropdownMenuLabel>
            {tags.map((tag) => {
              const checked = activeTags.includes(tag.id);
              return (
                <DropdownMenuCheckboxItem
                  key={tag.id}
                  checked={checked}
                  disabled={!checked && activeTags.length >= MAX_TAGS}
                  // Keep the menu open so several tags can be combined in one go.
                  onSelect={(event) => event.preventDefault()}
                  onCheckedChange={() => toggleTag(tag.id)}
                  className="cursor-pointer rounded-lg"
                >
                  {tag.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </>
        )}
        {/* Phones have no separate sort control in the header, so sorting lives here. */}
        <div className="sm:hidden">
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs text-muted-foreground">{t("sort")}</DropdownMenuLabel>
          {(["featured", "latest"] as const).map((value) => (
            <DropdownMenuItem key={value} onSelect={() => setSort(value)} className="cursor-pointer rounded-lg">
              <span className="flex-1">{t(value)}</span>
              {sort === value && <Check aria-hidden className="size-4" />}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
