/**
 * [INPUT]: 依赖 next/navigation 的路由与查询参数，依赖 @/components/ui/select
 * [OUTPUT]: 对外提供 SortSelect 客户端组件（featured/latest，push 写入 URL 并重置页码；顶部筛选胶囊内的无边框样式）
 * [POS]: components/layout 的排序控件，只在首页与分类列表显示
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { isListingPath } from "./filter-menu";

export function SortSelect() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  if (!isListingPath(pathname)) return null;

  const sort = params.get("sort") === "latest" ? "latest" : "featured";
  return (
    <Select
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
      <SelectTrigger
        aria-label={t("sort")}
        className="h-10 shrink-0 gap-1.5 rounded-full border-0 bg-transparent px-3.5 text-[15px] font-medium text-foreground shadow-none hover:bg-muted data-[state=open]:bg-muted [&_svg:not([class*='text-'])]:text-muted-foreground"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper" align="end" sideOffset={8} className="rounded-2xl p-1">
        <SelectItem value="featured">{t("featured")}</SelectItem>
        <SelectItem value="latest">{t("latest")}</SelectItem>
      </SelectContent>
    </Select>
  );
}
