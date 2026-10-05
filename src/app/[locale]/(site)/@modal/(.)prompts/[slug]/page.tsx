/**
 * [INPUT]: Catalog prompt lookup, locale validation, shared DetailModal/PromptDetail and canonical prompt metadata.
 * [OUTPUT]: InterceptedPrompt with a stable per-view modal href, and generateMetadata shared with the standalone detail.
 * [POS]: Native @modal interception for soft prompt navigation; direct visits and refreshes render the standalone page.
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
    <DetailModal href={`/${locale}/prompts/${slug}`}>
      <PromptDetail entry={entry} locale={locale} variant="modal" />
    </DetailModal>
  );
}
