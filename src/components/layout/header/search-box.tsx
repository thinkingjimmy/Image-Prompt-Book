/**
 * [INPUT]: 依赖 next/navigation 的 useRouter/usePathname/useSearchParams，依赖 @/lib/content/query 的规范化与序列化
 * [OUTPUT]: 对外提供 SearchBox 客户端组件
 * [POS]: components/layout 的搜索输入；300ms debounce + Enter 立即提交，均以 replace 写入 URL 并重置页码；无 JS 时退化为 GET 表单
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MAX_QUERY_LENGTH, normalizeQueryParam } from "@/lib/content/query";
import { cn } from "@/lib/utils";

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

  return (
    <form
      role="search"
      action={listingPath(pathname)}
      method="get"
      className={cn("relative flex min-w-0 items-center", className)}
      onSubmit={(event) => {
        event.preventDefault();
        submit(value);
      }}
    >
      <label htmlFor="site-search" className="sr-only">
        {t("search")}
      </label>
      <Search aria-hidden className={cn("pointer-events-none absolute left-3.5 size-4 text-muted-foreground", pending && "animate-pulse")} />
      <input
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
        className={cn(
          "h-10 w-full rounded-full bg-transparent pl-10 text-base outline-none transition-colors placeholder:text-muted-foreground hover:bg-muted/60 focus-visible:bg-muted/60 sm:text-[15px] [&::-webkit-search-cancel-button]:hidden",
          value ? "pr-9" : "pr-3",
        )}
      />
      {value && (
        <button
          type="button"
          aria-label={t("clearSearch")}
          onClick={() => {
            setValue("");
            submit("");
          }}
          className="absolute right-2 grid size-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
        </button>
      )}
    </form>
  );
}
