/**
 * [INPUT]: 依赖 ./prompt-state 的 data.variants/variant/setVariant
 * [OUTPUT]: 对外提供 VariantTabs（精简/完整等版本切换；单版本时显示“Prompt”标签）
 * [POS]: components/prompt/workbench 的版本切换，位于 Prompt 工具行左侧；每个版本各自保留选项
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { usePromptState } from "./prompt-state";

export function VariantTabs() {
  const t = useTranslations("detail");
  const { data, variant, setVariant } = usePromptState();
  if (data.variants.length < 2) return <span className="text-xs font-medium tracking-wide text-muted-foreground">Prompt</span>;

  return (
    <div role="radiogroup" aria-label={t("version")} className="flex rounded-full bg-muted p-0.5">
      {data.variants.map((item) => (
        <button
          key={item.id}
          type="button"
          role="radio"
          aria-checked={item.id === variant.id}
          onClick={() => setVariant(item.id)}
          className={cn(
            "h-7 rounded-full px-3 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground",
            item.id === variant.id && "bg-card text-foreground shadow-sm",
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
