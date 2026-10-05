/**
 * [INPUT]: Catalog collection lookup, locale validation, shared CollectionView/DetailModal and canonical collection metadata.
 * [OUTPUT]: InterceptedCollection and generateMetadata, sharing content and metadata with the standalone collection route.
 * [POS]: Native @modal interception for soft collection navigation; direct links and refreshes render the indexable standalone page.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { CollectionView } from "@/components/collections/collection-view";
import { DetailModal } from "@/components/prompt/detail-modal";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { findCollection } from "@/lib/content/catalog";
import { collectionMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const { slug } = await params;
  const view = findCollection(slug);
  return view ? collectionMetadata(view, locale) : {};
}

export default async function InterceptedCollection({ params }: Props) {
  const locale = await requireLocale(params);
  const { slug } = await params;
  setRequestLocale(locale);
  const view = findCollection(slug);
  if (!view) notFound();
  return (
    <DetailModal href={`/${locale}/collections/${slug}`} className="md:h-[min(88dvh,880px)] md:w-[min(1040px,94vw)]">
      <CollectionView view={view} locale={locale} variant="modal" />
    </DetailModal>
  );
}
