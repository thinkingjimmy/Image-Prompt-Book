/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 findEntry，依赖 @/components/prompt 的 DetailModal/PromptDetail，依赖 @/lib/seo 的 promptMetadata
 * [OUTPUT]: 默认导出被拦截的详情弹窗，generateMetadata（与独立详情一致）
 * [POS]: app/[locale]/(site)/@modal 的拦截路由；从列表软导航进入时渲染，刷新或直接访问则由独立详情页接管
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { DetailModal } from "@/components/prompt/detail-modal";
import { PromptDetail } from "@/components/prompt/prompt-detail";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { findEntry } from "@/lib/content/catalog";
import { promptMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const { slug } = await params;
  const entry = findEntry(slug);
  return entry ? promptMetadata(entry, locale) : {};
}

export default async function InterceptedPrompt({ params }: Props) {
  const locale = await requireLocale(params);
  const { slug } = await params;
  setRequestLocale(locale);
  const entry = findEntry(slug);
  if (!entry) notFound();
  return (
    <DetailModal>
      <PromptDetail entry={entry} locale={locale} variant="modal" />
    </DetailModal>
  );
}
