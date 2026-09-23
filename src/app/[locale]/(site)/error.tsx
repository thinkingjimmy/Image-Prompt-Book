/**
 * [INPUT]: 依赖 next-intl 的 useTranslations
 * [OUTPUT]: 默认导出 (site) 段的错误边界（可重试，不伪装为零结果）
 * [POS]: app/[locale]/(site) 的请求失败状态，覆盖 Gallery、分类与详情
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useTranslations } from "next-intl";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("gallery");
  return (
    <div role="alert" className="mx-auto my-20 flex max-w-md flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-12 text-center">
      <h1 className="text-base font-semibold">{t("errorTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("errorBody")}</p>
      <button type="button" onClick={reset} className="mt-3 inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">
        {t("retry")}
      </button>
    </div>
  );
}
