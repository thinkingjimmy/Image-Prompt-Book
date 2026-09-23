/**
 * [INPUT]: 依赖 next/navigation 的路由与查询参数，依赖 @/components/ui/dropdown-menu 与 @/components/ui/menu-radio-item
 * [OUTPUT]: 对外提供 SortSelect 客户端组件（featured/latest，push 写入 URL 并重置页码；顶部筛选胶囊内的无边框样式）
 * [POS]: components/layout/header 的排序控件，只在首页与分类列表显示；非模态下拉，打开时页面照常滚动
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MenuRadioItem } from "@/components/ui/menu-radio-item";
import { isListingPath } from "./filter-menu";

const SORTS = ["featured", "latest"] as const;

export function SortSelect() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  if (!isListingPath(pathname)) return null;

  const sort = params.get("sort") === "latest" ? "latest" : "featured";
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`${t("sort")}: ${t(sort)}`}
        // Phones sort from the filter menu, which keeps the one-row header roomy for search.
        className="group/sort hidden h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[15px] font-medium text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/30 data-[state=open]:bg-muted sm:inline-flex"
      >
        {t(sort)}
        <ChevronDown aria-hidden className="size-4 text-muted-foreground transition-transform group-data-[state=open]/sort:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-40 rounded-2xl p-1.5">
        <DropdownMenuRadioGroup
          value={sort}
          onValueChange={(value) => {
            const next = new URLSearchParams(params.toString());
            next.delete("page");
            if (value === "featured") next.delete("sort");
            else next.set("sort", value);
            const search = next.toString();
            startTransition(() => router.push(`${pathname}${search ? `?${search}` : ""}`, { scroll: false }));
          }}
        >
          {SORTS.map((value) => (
            <MenuRadioItem key={value} value={value}>
              {t(value)}
            </MenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
