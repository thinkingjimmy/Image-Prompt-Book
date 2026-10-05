/**
 * [INPUT]: Radix Dialog, shared ScrollArea, router hooks, the intercepted view's stable href and modal origin/focus tracking.
 * [OUTPUT]: DetailModal with href, optional className and per-view scroll restoration, plus ModalTitle.
 * [POS]: Shared prompt/collection route modal; native history returns to the opening list or collection, with nested-layer Escape and focus restoration.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useRef, type ReactNode } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { restoreListFocus, wasOpenedFromList } from "@/lib/prompt/opened-from-list";
import { cn } from "@/lib/utils";

const scrollPositions = new Map<string, number>();
let returningFrom: string | undefined;

export function ModalTitle({ children }: { children: ReactNode }) {
  return (
    <DialogPrimitive.Title tabIndex={-1} data-modal-title className="outline-none">
      {children}
    </DialogPrimitive.Title>
  );
}

export function DetailModal({ children, href, className }: { children: ReactNode; href: string; className?: string }) {
  const t = useTranslations("detail");
  const locale = useLocale();
  const router = useRouter();
  const pathname = href;
  const content = useRef<HTMLDivElement>(null);
  const releaseScroll = useRef<(() => void) | undefined>(undefined);

  // The Radix portal mounts after the shell's effects; bind restoration when its DOM is ready.
  const bindContent = useCallback((node: HTMLDivElement | null) => {
    releaseScroll.current?.();
    releaseScroll.current = undefined;
    content.current = node;
    const viewport = node?.querySelector<HTMLElement>(".detail-modal-viewport");
    if (!viewport) return;
    viewport.scrollTop = scrollPositions.get(pathname) ?? 0;
    const remember = () => scrollPositions.set(pathname, viewport.scrollTop);
    viewport.addEventListener("scroll", remember, { passive: true });
    releaseScroll.current = () => {
      remember();
      viewport.removeEventListener("scroll", remember);
    };
  }, [pathname]);

  // The modal unmounts through navigation, so Radix never sees a close; hand focus back to the card ourselves.
  useEffect(
    () => () => {
      if (window.location.pathname !== pathname) returningFrom = pathname;
      requestAnimationFrame(() => {
        if (window.location.pathname !== pathname) restoreListFocus(pathname);
      });
    },
    [pathname],
  );

  function close() {
    returningFrom = pathname;
    if (wasOpenedFromList(pathname)) router.back();
    else router.push(`/${locale}`, { scroll: false });
  }

  return (
    <DialogPrimitive.Root open onOpenChange={(open) => !open && close()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="glass-overlay fixed inset-0 z-50 grid place-items-center data-[state=open]:animate-in data-[state=open]:fade-in-0 md:p-6">
          <DialogPrimitive.Content
            ref={bindContent}
            aria-describedby={undefined}
            // Long content: focus the title, never an input that would pop the mobile keyboard.
            // Esc belongs to the innermost layer: never close the detail while a lightbox or menu sits above it.
            onEscapeKeyDown={(event) => {
              const nested = document.querySelectorAll('[role="dialog"][data-state="open"], [role="menu"]');
              if (nested.length > 1 || (nested.length === 1 && !content.current?.isSameNode(nested[0]!))) event.preventDefault();
            }}
            onOpenAutoFocus={(event) => {
              event.preventDefault();
              const restored = returningFrom && restoreListFocus(returningFrom);
              returningFrom = undefined;
              if (!restored) content.current?.querySelector<HTMLElement>("[data-modal-title]")?.focus({ preventScroll: true });
            }}
            className={cn("relative flex h-dvh w-full flex-col overflow-hidden bg-background shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98] md:h-auto md:w-auto md:max-w-[94vw] md:rounded-lg", className)}
          >
            <DialogPrimitive.Close
              aria-label={t("close")}
              className="site-control site-icon-control absolute top-[max(0.75rem,env(safe-area-inset-top))] right-3 z-20 bg-card/95 text-foreground backdrop-blur"
            >
              <X className="size-4" aria-hidden />
            </DialogPrimitive.Close>
            {/* Phones scroll the whole sheet; wider screens keep the image fixed and scroll only the prompt. */}
            <ScrollArea className="h-full" viewportClassName="detail-modal-viewport" contentClassName="pt-[env(safe-area-inset-top)] md:h-full md:pt-0">
              {children}
            </ScrollArea>
          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
