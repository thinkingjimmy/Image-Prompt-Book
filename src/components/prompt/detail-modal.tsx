/**
 * [INPUT]: 依赖 radix-ui Dialog，依赖 @/components/ui/scroll-area，依赖 next/navigation 的 useRouter/usePathname，依赖 @/lib/prompt/opened-from-list
 * [OUTPUT]: 对外提供 DetailModal（路由弹窗外壳）与 ModalTitle
 * [POS]: components/prompt 的拦截路由弹窗：桌面双栏、窄屏全屏；只有确认从本站列表打开时才 router.back()，否则回到 Gallery
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useEffect, useRef, type ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { restoreListFocus, wasOpenedFromList } from "@/lib/prompt/opened-from-list";

export function ModalTitle({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Title tabIndex={-1} data-modal-title className="outline-none">
      {children}
    </DialogPrimitive.Title>
  );
}

export function DetailModal({ children }: { children: ReactNode }) {
  const t = useTranslations("detail");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const content = useRef<HTMLDivElement>(null);

  // The modal unmounts through navigation, so Radix never sees a close; hand focus back to the card ourselves.
  useEffect(
    () => () => {
      requestAnimationFrame(() => {
        if (window.location.pathname !== pathname) restoreListFocus(pathname);
      });
    },
    [pathname],
  );

  function close() {
    if (wasOpenedFromList(pathname)) router.back();
    else router.push(`/${locale}`, { scroll: false });
  }

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="glass-overlay fixed inset-0 z-50 grid place-items-center data-[state=open]:animate-in data-[state=open]:fade-in-0 md:p-6">
          <DialogPrimitive.Content
            ref={content}
            aria-describedby={undefined}
            // Long content: focus the title, never an input that would pop the mobile keyboard.
            // Esc belongs to the innermost layer: never close the detail while a lightbox, menu or listbox sits above it.
            onEscapeKeyDown={(event) => {
              const nested = document.querySelectorAll('[role="dialog"][data-state="open"], [role="listbox"], [role="menu"]');
              if (nested.length > 1 || (nested.length === 1 && !content.current?.isSameNode(nested[0]!))) event.preventDefault();
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              content.current?.querySelector<HTMLElement>("[data-modal-title]")?.focus();
            }}
            className="relative flex h-dvh w-full flex-col overflow-hidden bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] md:h-auto md:w-auto md:max-w-[94vw] md:rounded-[24px]"
          >
            <DialogPrimitive.Close
              aria-label={t("close")}
              className="absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20 grid size-10 place-items-center rounded-full border border-border bg-card/95 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-muted"
            >
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
            {/* Phones scroll the whole sheet; wider screens keep the image fixed and scroll only the prompt. */}
            <ScrollArea className="h-full" contentClassName="pt-[env(safe-area-inset-top)] md:h-full md:pt-0">
              {children}
            </ScrollArea>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
