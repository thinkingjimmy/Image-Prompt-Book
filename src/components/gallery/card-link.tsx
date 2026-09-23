/**
 * [INPUT]: 依赖 @/i18n/navigation 的 Link，依赖 @/lib/prompt/opened-from-list 的 markOpenedFromList
 * [OUTPUT]: 对外提供 CardLink（真实详情 anchor；普通左键记录“从列表打开”以便弹窗关闭时安全后退）
 * [POS]: components/gallery 的详情链接；中键、Cmd/Ctrl 点击与新标签保持浏览器原生行为
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { markOpenedFromList } from "@/lib/prompt/opened-from-list";

export function CardLink({ href, onClick, ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  return (
    <Link
      {...props}
      href={href}
      scroll={false}
      onClick={(event) => {
        onClick?.(event);
        const plain = event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
        if (plain && !event.defaultPrevented) markOpenedFromList(event.currentTarget.pathname, event.currentTarget);
      }}
    />
  );
}
