/**
 * [INPUT]: 依赖 ./prompt-state 的状态与提示，依赖 @/lib/prompt/clipboard，依赖 @/components/ui 的 Button/Dialog
 * [OUTPUT]: 对外提供 PromptActions 客户端组件：part=primary（复制 Prompt、在 ChatGPT 中使用）/ reset（仅在修改后出现）/ share（复制带当前设置的链接）
 * [POS]: components/prompt/workbench 的操作集合；复制内容始终来自同一 selections 状态，剪贴板失败时给出可全选文本，不虚报成功
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ArrowUpRight, Check, Copy, RotateCcw, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { copyText } from "@/lib/prompt/clipboard";
import { usePromptState } from "./prompt-state";

const quietIcon = "size-8 rounded-full text-muted-foreground hover:text-foreground [&_svg]:size-4";

export function PromptActions({ part }: { part: "primary" | "reset" | "share" }) {
  const t = useTranslations("detail");
  const { output, edited, reset, shareUrl, notify } = usePromptState();
  const [manual, setManual] = useState<string | null>(null);
  const [justCopied, setJustCopied] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function copy(text: string, success: string) {
    if (await copyText(text)) {
      notify(success);
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
      <div className="flex items-center gap-2">
        <Button
          size="lg"
          data-testid="copy-prompt"
          className="h-11 min-w-0 flex-1 rounded-full px-4 text-[15px]"
          onClick={async () => {
            if (await copy(output, t("copied"))) {
              setJustCopied(true);
              clearTimeout(copiedTimer.current);
              copiedTimer.current = setTimeout(() => setJustCopied(false), 1600);
            }
          }}
        >
          {justCopied ? <Check aria-hidden /> : <Copy aria-hidden />}
          {t("copyPrompt")}
        </Button>
        <Button asChild variant="outline" size="lg" className="h-11 min-w-0 flex-1 rounded-full bg-card px-4 text-[15px]">
          <a
            href={chatgptUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="use-in-chatgpt"
            onClick={() => {
              // Also on the clipboard, in case ChatGPT ignores the pre-fill (e.g. signed out).
              void copyText(output);
              notify(t("chatgptOpened"), "info");
            }}
          >
            {t("useInChatGPT")}
            <ArrowUpRight aria-hidden />
          </a>
        </Button>
      </div>
    );
  } else if (part === "reset") {
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
  } else {
    content = (
      <Button variant="ghost" size="icon" className={quietIcon} aria-label={t("share")} title={t("share")} onClick={() => void copy(shareUrl(), t("linkCopied"))}>
        <Share2 aria-hidden />
      </Button>
    );
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
