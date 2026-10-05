/**
 * [INPUT]: Locale-aware Link and modal origin/focus tracking
 * [OUTPUT]: CardLink, recording plain-click origins for native detail modals while preserving modified-click browser behavior
 * [POS]: Shared prompt/collection detail anchor; used by gallery cards and collection member links
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
