/**
 * [INPUT]: 依赖 radix-ui DropdownMenu 的 RadioItem/ItemIndicator，依赖 lucide-react 的 Check，依赖 @/lib/utils 的 cn
 * [OUTPUT]: 对外提供 MenuRadioItem（右侧对勾的单选菜单项）
 * [POS]: components/ui 的项目自有组件，配合 dropdown-menu 的 DropdownMenuRadioGroup，被参数下拉与排序下拉共用
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Check } from "lucide-react";
import { DropdownMenu as DropdownMenuPrimitive } from "radix-ui";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** A single-choice menu row with the check on the trailing edge, matching the site's other menus. */
export function MenuRadioItem({ className, children, ...props }: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem
      data-slot="menu-radio-item"
      className={cn(
        "relative flex cursor-pointer items-center rounded-lg py-1.5 pr-8 pl-2 text-sm outline-hidden transition-colors select-none focus:bg-accent focus:text-accent-foreground",
        className,
      )}
      {...props}
    >
      {children}
      <DropdownMenuPrimitive.ItemIndicator className="absolute right-2 flex">
        <Check aria-hidden className="size-4 text-muted-foreground" />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  );
}
