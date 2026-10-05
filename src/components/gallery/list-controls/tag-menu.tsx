/**
 * [INPUT]: Radix dropdown primitives, native Next links, shared ScrollArea/focus modality and canonical tag options from ListToolbar.
 * [OUTPUT]: TagMenu, a borderless trigger and custom-scrolled menu with AND selection and a five-tag limit.
 * [POS]: Client interaction for the quiet gallery toolbar; real anchor hrefs preserve browser navigation and no-JS discovery.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Check, ChevronDown, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { DropdownMenu as Menu } from "radix-ui";
import { useKeyboardFocus } from "@/components/layout/controls/use-keyboard-focus";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MAX_TAGS } from "@/lib/content/query";

type TagOption = { id: string; label: string; checked: boolean; disabled: boolean; href: string };

export function TagMenu({ options, count, allHref }: { options: TagOption[]; count: number; allHref: string }) {
  const t = useTranslations("gallery");
  const keyboardFocus = useKeyboardFocus();

  return (
    <Menu.Root modal={false}>
      <Menu.Trigger className="site-control hidden text-muted-foreground js:inline-flex data-[state=open]:bg-muted data-[state=open]:text-foreground" aria-label={count ? t("filterCount", { count }) : t("filters")}>
        <SlidersHorizontal aria-hidden className="size-4" strokeWidth={1.7} />
        <span>{t("filters")}</span>
        {count > 0 && <span aria-hidden className="tabular-nums">{count}</span>}
        <ChevronDown aria-hidden className="size-3" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Content align="end" sideOffset={10} collisionPadding={16} aria-label={t("filterLabel")} aria-labelledby={undefined} data-keyboard-focus={keyboardFocus} className="keyboard-focus-scope z-50 w-58 overflow-hidden rounded-lg bg-popover p-1.5 shadow-[0_0_0_1px_rgb(0_0_0/0.06),0_8px_24px_rgb(0_0_0/0.10)]">
          <ScrollArea viewportClassName="max-h-[min(390px,var(--radix-dropdown-menu-content-available-height))]" contentClassName="p-0.5">
            <Menu.Label className="flex min-h-8 items-center justify-between gap-3 px-3 text-xs text-muted-foreground">
              <span>{t("tags")}</span>
              <span className="tabular-nums">{t("selectedTags", { count, max: MAX_TAGS })}</span>
            </Menu.Label>
            <Menu.Item asChild className="filter-menu-item">
              <Link href={allHref} scroll={false} aria-current={!count ? "true" : undefined}>
                <span>{t("allTags")}</span>
                {!count && <Check aria-hidden className="size-4" />}
              </Link>
            </Menu.Item>
            <Menu.Group>
              {options.map((option) => (
                <Menu.CheckboxItem key={option.id} asChild={!option.disabled} checked={option.checked} disabled={option.disabled} textValue={option.label} className="filter-menu-item">
                  {option.disabled ? <span>{option.label}</span> : (
                    <Link href={option.href} scroll={false} rel="nofollow" aria-label={t(option.checked ? "removeTag" : "tagFilter", { tag: option.label })}>
                      <span>{option.label}</span>
                      <Menu.ItemIndicator><Check aria-hidden className="size-4" /></Menu.ItemIndicator>
                    </Link>
                  )}
                </Menu.CheckboxItem>
              ))}
            </Menu.Group>
          </ScrollArea>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}
