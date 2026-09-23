/**
 * [INPUT]: 依赖 @/components/ui/dialog，依赖 @/lib/site 的 repoIssueUrl/repoReadmeUrl，依赖 @/i18n/navigation 的 Link
 * [OUTPUT]: 对外提供 SubmitDialog（右上角 + 按钮与“提交 Prompt”弹窗）
 * [POS]: components/pages 的投稿入口：两条 GitHub 路径（开 Issue 推荐来源 / PR 提交完整模板）+ 权利反馈与完整说明链接，不要求会写代码
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ArrowUpRight, FileCode2, Lightbulb, Plus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/config";
import { repoIssueUrl, repoReadmeUrl } from "@/lib/site";

export function SubmitDialog({ triggerClassName }: { triggerClassName: string }) {
  const t = useTranslations("submit");
  const locale = useLocale() as Locale;
  const options = [
    { icon: Lightbulb, title: t("sourceTitle"), body: t("sourceBody"), cta: t("sourceCta"), href: repoIssueUrl("source-lead.yml") },
    { icon: FileCode2, title: t("templateTitle"), body: t("templateBody"), cta: t("templateCta"), href: repoReadmeUrl(locale, "submit") },
  ];

  return (
    <Dialog>
      <DialogTrigger aria-label={t("title")} title={t("title")} className={triggerClassName}>
        <Plus className="size-5" aria-hidden />
      </DialogTrigger>
      <DialogContent className="gap-5 rounded-[24px] p-6 sm:max-w-md">
        <DialogHeader className="gap-1.5 text-left">
          <DialogTitle className="text-xl tracking-tight">{t("title")}</DialogTitle>
          <DialogDescription className="text-[15px] leading-relaxed">{t("body")}</DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-2.5">
          {options.map(({ icon: Icon, title, body, cta, href }) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex gap-3.5 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-foreground/25"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-param text-param-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="font-semibold">{title}</span>
                  <span className="text-sm leading-relaxed text-muted-foreground">{body}</span>
                  <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium">
                    {cta}
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <p className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
          <Link href="/contribute" className="rounded-sm hover:text-foreground">
            {t("guide")}
          </Link>
          <a href={repoIssueUrl("rights-request.yml")} target="_blank" rel="noopener noreferrer" className="rounded-sm hover:text-foreground">
            {t("rights")}
          </a>
        </p>
      </DialogContent>
    </Dialog>
  );
}
