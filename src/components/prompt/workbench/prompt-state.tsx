/**
 * [INPUT]: 依赖 @/lib/prompt 的 template/share/draft（默认值、hash 解码、草稿读写），依赖 next-intl 的 useTranslations
 * [OUTPUT]: 对外提供 PromptStateProvider、usePromptState()、PromptData 类型
 * [POS]: components/prompt/workbench 的唯一 selections 状态源（Prompt 语言固定为站点语言）；编辑视图、复制与分享都从这里读，初始化优先级：分享 hash → 当前版本草稿 → 默认值
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useTranslations } from "next-intl";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import type { Parameter } from "@/lib/content/schema";
import { readDraft, writeDraft } from "@/lib/prompt/draft";
import { decodeShareHash } from "@/lib/prompt/share";
import { composePrompt, defaultSelections, type Selections } from "@/lib/prompt/template";
import { cn } from "@/lib/utils";

export type PromptData = {
  slug: string;
  templateVersion: string;
  /** The prompt is shown, edited and copied in the site language only. */
  uiLocale: Locale;
  outputLocales: Locale[];
  parameters: Parameter[];
  parameterLabels: Record<string, string>;
  templates: Partial<Record<Locale, string>>;
  attribution: string;
};

type Notice = { id: number; message: string; tone: "success" | "info" | "warning" };

type PromptState = {
  data: PromptData;
  selections: Selections;
  outputLocale: Locale;
  output: string;
  setSelection: (parameterId: string, optionId: string) => void;
  reset: () => void;
  notify: (message: string, tone?: Notice["tone"]) => void;
};

const Context = createContext<PromptState | null>(null);

export function usePromptState(): PromptState {
  const value = useContext(Context);
  if (!value) throw new Error("usePromptState must be used inside PromptStateProvider");
  return value;
}

function promptLocale(data: PromptData): Locale {
  return data.outputLocales.includes(data.uiLocale) ? data.uiLocale : data.outputLocales[0]!;
}

export function PromptStateProvider({ data, children }: { data: PromptData; children: ReactNode }) {
  const t = useTranslations("detail");
  const [selections, setSelections] = useState<Selections>(() => defaultSelections(data.parameters));
  const outputLocale = promptLocale(data);
  const [ready, setReady] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);
  const noticeId = useRef(0);
  const initialized = useRef(false);

  const notify = useCallback((message: string, tone: Notice["tone"] = "success") => {
    const id = ++noticeId.current;
    setNotices((items) => [...items.slice(-2), { id, message, tone }]);
    setTimeout(() => setNotices((items) => items.filter((item) => item.id !== id)), tone === "warning" ? 6000 : 2800);
  }, []);

  useEffect(() => {
    const context = { templateVersion: data.templateVersion, parameters: data.parameters, outputLocales: data.outputLocales };
    const dropHash = () => window.history.replaceState(window.history.state, "", window.location.pathname + window.location.search);

    /** Applies a settings hash; returns false when the URL carries none. */
    const applyHash = () => {
      const shared = decodeShareHash(window.location.hash, context);
      if (shared.status === "none") return false;
      if (shared.status === "ok") {
        setSelections(shared.selections);
        notify(shared.fallbacks.length ? t("hashFallback") : t("hashApplied"), shared.fallbacks.length ? "warning" : "info");
      } else {
        // A broken or outdated link shows defaults, never the recipient's unrelated draft.
        setSelections(defaultSelections(data.parameters));
        notify(shared.reason === "version" ? t("hashVersion") : t("hashInvalid"), "warning");
      }
      dropHash();
      return true;
    };

    /* eslint-disable react-hooks/set-state-in-effect -- one-time hydration from URL/sessionStorage, unavailable during SSR */
    // Runs once even when effects are replayed (dev strict mode), so a stale draft never overrides a shared link.
    if (!initialized.current && !applyHash()) {
      const draft = readDraft(data.slug, data.templateVersion, data.parameters);
      if (draft) setSelections(draft.selections);
    }
    initialized.current = true;
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */

    // A settings link pasted into this same tab only changes the hash; apply it too.
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [data, notify, t]);

  useEffect(() => {
    if (ready) writeDraft(data.slug, data.templateVersion, { selections, outputLocale: null });
  }, [ready, data.slug, data.templateVersion, selections]);

  const value = useMemo<PromptState>(
    () => ({
      data,
      selections,
      outputLocale,
      output: composePrompt({ record: data, selections, outputLocale }),
      setSelection: (parameterId, optionId) => setSelections((current) => ({ ...current, [parameterId]: optionId })),
      reset: () => setSelections(defaultSelections(data.parameters)),
      notify,
    }),
    [data, selections, outputLocale, notify],
  );

  return (
    <Context.Provider value={value}>
      {children}
      <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-[70] flex flex-col items-center gap-2 px-4">
        {notices.map((notice) => (
          <p
            key={notice.id}
            className={cn(
              "animate-in fade-in-0 slide-in-from-bottom-2 max-w-md rounded-full px-4 py-2 text-center text-sm shadow-lg duration-200",
              notice.tone === "warning" ? "bg-warning-bg text-warning-foreground ring-1 ring-warning-foreground/15" : "bg-foreground text-background",
            )}
          >
            {notice.message}
          </p>
        ))}
      </div>
    </Context.Provider>
  );
}
