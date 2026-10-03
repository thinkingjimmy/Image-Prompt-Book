/**
 * [INPUT]: Prompt state, clipboard helper, safe analytics events and Button/Dialog UI.
 * [OUTPUT]: PromptActions for copy, ChatGPT, share and reset; successful actions emit identifier-only usage events.
 * [POS]: Workbench action row; preserves manual-copy fallback and never reports failed copying as success.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ArrowUpRight, Check, Copy, RotateCcw, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Tooltip as TooltipPrimitive } from "radix-ui";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trackPromptEvent } from "@/lib/analytics/events";
import { copyText } from "@/lib/prompt/clipboard";
import { usePromptState } from "./prompt-state";

const quietIcon = "size-8 rounded-full text-muted-foreground hover:text-foreground [&_svg]:size-4";

export function PromptActions({ part }: { part: "primary" | "reset" }) {
  const t = useTranslations("detail");
  const { data, variant, output, edited, reset, shareUrl, notify } = usePromptState();
  const [manual, setManual] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy(text: string, success: string, event: "copy_prompt" | "share_prompt") {
    if (await copyText(text)) {
      notify(success);
      trackPromptEvent(event, { prompt_slug: data.slug, locale: data.uiLocale, variant: variant.id });
      return true;
    }
    setManual(text);
    return false;
  }

  let content: React.ReactNode = null;
  if (part === "primary") {
    // Same handoff as the source site: ChatGPT pre-fills its composer from `?prompt=`.
    const chatgptUrl = `https://chatgpt.com/?prompt=${encodeURIComponent(output)}`;
    content = (
      <div className="@container flex items-center gap-2">
        <Button
          size="lg"
          data-testid="copy-prompt"
          aria-label={t("copyPrompt")}
          className="h-10 min-w-0 flex-1 gap-1.5 rounded-full px-3 text-sm [&_svg]:size-4"
          onClick={async () => {
            if (await copy(output, t("copied"), "copy_prompt")) {
              setJustCopied(true);
              clearTimeout(copiedTimer.current);
              copiedTimer.current = setTimeout(() => setJustCopied(false), 1600);
            }
          }}
        >
          {justCopied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {/* Short labels whenever this row is narrow (phones, tight side panels); the accessible name stays complete. */}
          <span className="truncate @sm:hidden">{t("copyShort")}</span>
          <span className="hidden truncate @sm:inline">{t("copyPrompt")}</span>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-10 min-w-0 flex-1 gap-1.5 rounded-full bg-card px-3 text-sm [&_svg]:size-4">
          <a
            href={chatgptUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="use-in-chatgpt"
            aria-label={t("useInChatGPT")}
            onClick={() => {
              // Also on the clipboard, in case ChatGPT ignores the pre-fill (e.g. signed out).
              void copyText(output);
              notify(t("chatgptOpened"), "info");
              trackPromptEvent("open_chatgpt", { prompt_slug: data.slug, locale: data.uiLocale, variant: variant.id });
            }}
          >
            <span className="truncate @sm:hidden">ChatGPT</span>
            <span className="hidden truncate @sm:inline">{t("useInChatGPT")}</span>
            <ArrowUpRight aria-hidden />
          </a>
        </Button>
        <TooltipPrimitive.Provider delayDuration={150}>
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-full bg-card [&_svg]:size-4"
                aria-label={t("share")}
                onClick={() => void copy(shareUrl(), t("linkCopied"), "share_prompt")}
              >
                <Share2 aria-hidden />
              </Button>
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                sideOffset={8}
                className="z-[80] rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg data-[state=delayed-open]:animate-in data-[state=delayed-open]:fade-in-0"
              >
                {t("shareTooltip")}
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
        </TooltipPrimitive.Provider>
      </div>
    );
  } else {
    content = edited ? (
      <Button
        variant="ghost"
        size="icon"
        className={quietIcon}
        aria-label={t("reset")}
        title={t("reset")}
        onClick={() => {
          reset();
          notify(t("resetDone"), "info");
        }}
      >
        <RotateCcw aria-hidden />
      </Button>
    ) : null;
  }

  return (
    <>
      {content}
      <Dialog open={manual !== null} onOpenChange={(open) => !open && setManual(null)}>
        <DialogContent className="max-w-[min(40rem,calc(100%-2rem))] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("copyFailedTitle")}</DialogTitle>
            <DialogDescription>{t("copyFailedBody")}</DialogDescription>
          </DialogHeader>
          <textarea
            readOnly
            value={manual ?? ""}
            aria-label={t("copyFailedTitle")}
            data-testid="manual-copy"
            ref={(node) => {
              if (node) requestAnimationFrame(() => node.select());
            }}
            onFocus={(event) => event.currentTarget.select()}
            className="h-72 w-full resize-none rounded-lg border border-input bg-muted/40 p-3 font-mono text-[13px] leading-relaxed"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
