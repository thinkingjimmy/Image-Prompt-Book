/**
 * [INPUT]: 依赖 next-intl/server 的 getTranslations，依赖 @/lib/content 的 PromptEntry/contentFor
 * [OUTPUT]: 对外提供 PromptAbout 服务端组件与 TEXT_LINK 链接样式
 * [POS]: components/prompt 的“关于这个 Prompt”区块，被 PromptDetail 放在可编辑 Prompt 之后；把条目已写好的输入要求、步骤、案例/改编/许可说明与全部来源呈现为页面可见文字，结构化数据只引用这里可见的事实
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";
import type { Locale } from "@/i18n/config";
import { contentFor } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";

export const TEXT_LINK = "rounded-sm underline decoration-foreground/15 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/40";

function Item({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <dt className="font-medium text-foreground">{term}</dt>
      <dd className="text-muted-foreground">{children}</dd>
    </div>
  );
}

export async function PromptAbout({ entry, locale }: { entry: PromptEntry; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "detail" });
  const content = contentFor(entry, locale);

  return (
    <section aria-labelledby="prompt-about" data-testid="prompt-about" className="mt-8 border-t border-border/60 pt-5 text-[13px] leading-relaxed">
      <h2 id="prompt-about" className="mb-3 text-sm font-semibold">
        {t("about")}
      </h2>
      <dl className="flex flex-col gap-4">
        <Item term={t("aboutInput")}>{content.inputRequirement}</Item>
        <Item term={t("aboutSteps")}>
          <ol className="list-decimal space-y-0.5 pl-4">
            {content.howToUse.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </Item>
        {/* Chinese sentences run on without a space; English ones need one. */}
        <Item term={t("aboutExamples")}>{[content.exampleNotice, content.verificationNotice].join(locale === "zh-CN" ? "" : " ")}</Item>
        <Item term={t("aboutAdaptation")}>{content.adaptationNotice}</Item>
        <Item term={t("aboutLicense")}>{content.licenseNotice}</Item>
        <Item term={t("aboutSources")}>
          <ul className="space-y-1">
            {entry.meta.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className={TEXT_LINK}>
                  {source.title}
                </a>
                {" · "}
                {t(source.role === "original" ? "sourceOriginal" : "sourceSupplementary")}
                {source.author && ` · ${source.author.name}`}
                {" · "}
                {t("sourceChecked", { date: source.checkedAt })}
              </li>
            ))}
          </ul>
        </Item>
      </dl>
    </section>
  );
}
