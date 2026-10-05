/**
 * [INPUT]: Router/path/search hooks, localized messages, query normalization and shared keyboard focus modality.
 * [OUTPUT]: SearchBox, a compact icon trigger revealing a 16px/44px field; closing preserves the draft and restores trigger focus.
 * [POS]: Header search; retains 300ms debounce, Enter/IME handling, pagination reset and a visible native GET form without JavaScript.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MAX_QUERY_LENGTH, normalizeQueryParam } from "@/lib/content/query";
import { cn } from "@/lib/utils";
import { useKeyboardFocus } from "../controls/use-keyboard-focus";

const DEBOUNCE_MS = 300;

/** Searches stay within the current listing (home or category); elsewhere they go to the locale home. */
function listingPath(pathname: string): string {
  const match = pathname.match(/^\/([^/]+)(\/categories\/[^/]+)?\/?$/);
  if (match) return pathname.replace(/\/$/, "");
  return `/${pathname.split("/")[1] ?? ""}`;
}

export function SearchBox({ className }: { className?: string }) {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const urlQuery = params.get("q") ?? "";
  const [value, setValue] = useState(urlQuery);
  const [open, setOpen] = useState(Boolean(urlQuery));
  const keyboardFocus = useKeyboardFocus();
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const focusRequested = useRef(false);
  const [pending, startTransition] = useTransition();
  const composing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const lastSubmitted = useRef(urlQuery);

  // Follow external URL changes (back/forward, "clear filters") without rewriting what the user is typing.
  useEffect(() => {
    if (normalizeQueryParam(value) !== urlQuery && urlQuery !== lastSubmitted.current) {
      lastSubmitted.current = urlQuery;
      setValue(urlQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to URL changes
  }, [urlQuery]);

  useEffect(() => () => clearTimeout(timer.current), []);

  function submit(raw: string) {
    clearTimeout(timer.current);
    const q = normalizeQueryParam(raw);
    const target = listingPath(pathname);
    const onListing = target === pathname.replace(/\/$/, "");
    if (onListing && q === (params.get("q") ?? "")) return;
    const next = new URLSearchParams(onListing ? params.toString() : "");
    next.delete("page");
    if (q) next.set("q", q);
    else next.delete("q");
    const search = next.toString();
    lastSubmitted.current = q;
    startTransition(() => {
      const href = `${target}${search ? `?${search}` : ""}`;
      if (onListing) router.replace(href, { scroll: false });
      else router.push(href);
    });
  }

  function schedule(raw: string) {
    clearTimeout(timer.current);
    if (composing.current) return;
    timer.current = setTimeout(() => submit(raw), DEBOUNCE_MS);
  }

  function close() {
    clearTimeout(timer.current);
    setOpen(false);
    requestAnimationFrame(() => trigger.current?.focus());
  }

  useEffect(() => {
    if (open && focusRequested.current) {
      input.current?.focus({ preventScroll: true });
      focusRequested.current = false;
    }
  }, [open]);

  return (
    <div className={cn("site-search keyboard-focus-scope", className)} data-open={open} data-keyboard-focus={keyboardFocus}>
      {!open && (
        <button
          ref={trigger}
          type="button"
          className="site-control site-icon-control site-search-trigger text-muted-foreground"
          aria-label={t("search")}
          aria-expanded={false}
          aria-controls="site-search-form"
          onClick={() => {
            focusRequested.current = true;
            setOpen(true);
          }}
        >
          <Search aria-hidden className="size-4" strokeWidth={1.7} />
          {urlQuery && <span aria-hidden className="absolute top-1 right-1 size-1 rounded-lg bg-current" />}
        </button>
      )}
      <form
        id="site-search-form"
        role="search"
        action={listingPath(pathname)}
        method="get"
        className="site-search-form min-w-0"
        onSubmit={(event) => {
          event.preventDefault();
          submit(value);
        }}
      >
        <label htmlFor="site-search" className="sr-only">
          {t("search")}
        </label>
        <Search aria-hidden strokeWidth={1.7} className={cn("pointer-events-none absolute left-3 size-4 text-muted-foreground", pending && "animate-pulse")} />
        <input
          ref={input}
          id="site-search"
          name="q"
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          spellCheck={false}
          maxLength={MAX_QUERY_LENGTH}
          value={value}
          placeholder={t("searchPlaceholder")}
          onChange={(event) => {
            setValue(event.target.value);
            schedule(event.target.value);
          }}
          onCompositionStart={() => {
            composing.current = true;
          }}
          onCompositionEnd={(event) => {
            composing.current = false;
            schedule(event.currentTarget.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape" && !composing.current) {
              event.preventDefault();
              close();
            }
          }}
          className="h-11 w-full rounded-lg bg-transparent pr-11 pl-10 text-base placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="button"
          aria-label={t("closeSearch")}
          onClick={close}
          className="site-control site-icon-control site-search-close absolute top-1.5 right-1.5 text-muted-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      </form>
    </div>
  );
}
