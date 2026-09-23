/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 findEntry/findRedirect/getVisibleEntries，依赖 @/components/prompt 的 PromptDetail，依赖 @/lib/seo
 * [OUTPUT]: 默认导出独立详情页，generateMetadata，generateStaticParams
 * [POS]: app/[locale]/(site) 的详情路由：直接访问、刷新与新标签的完整页面；未知/草稿/归档 404，登记过的旧 slug 永久重定向
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd } from "@/components/layout/json-ld";
import { PromptDetail } from "@/components/prompt/prompt-detail";
import type { Locale } from "@/i18n/config";
import { requireLocale } from "@/i18n/locale-param";
import { contentFor, findEntry, findRedirect, getLibrary, getVisibleEntries } from "@/lib/content/catalog";
import { composePrompt, defaultSelections } from "@/lib/prompt/template";
import { promptMetadata } from "@/lib/seo/metadata";
import { breadcrumbJsonLd, creativeWorkJsonLd } from "@/lib/seo/structured-data";
import { categoryPath, promptPath, withLocale } from "@/lib/seo/urls";
import { absoluteUrl, mediaUrl } from "@/lib/site";

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return getVisibleEntries().map((entry) => ({ slug: entry.meta.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await requireLocale(params);
  const { slug } = await params;
  const entry = findEntry(slug);
  return entry ? promptMetadata(entry, locale) : {};
}

export default async function PromptPage({ params }: Props) {
  const locale = await requireLocale(params);
  const { slug } = await params;
  setRequestLocale(locale);
  const entry = findEntry(slug);
  if (!entry) {
    const moved = findRedirect(slug);
    if (moved) permanentRedirect(withLocale(locale, promptPath(moved)));
    notFound();
  }

  const content = contentFor(entry, locale);
  const pages = await getTranslations({ locale, namespace: "pages" });
  const category = getLibrary().taxonomy.categories.find((item) => item.id === entry.meta.category)!;
  const source = entry.meta.sources.find((item) => item.role === "original") ?? entry.meta.sources[0]!;
  const url = absoluteUrl(withLocale(locale, promptPath(slug)));

  return (
    <div className="mx-auto max-w-[1400px] px-4 pt-6 pb-4 sm:px-6 lg:px-8 lg:pt-10">
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: pages("breadcrumbHome"), url: absoluteUrl(withLocale(locale, "")) },
            { name: category.labels[locale], url: absoluteUrl(withLocale(locale, categoryPath(category.id))) },
            { name: content.title, url },
          ]),
          creativeWorkJsonLd({
            locale,
            name: content.title,
            description: content.summary,
            url,
            text: composePrompt({ record: entry, selections: defaultSelections(entry.parameters), outputLocale: locale }),
            license: entry.meta.rights.licenseUrl,
            dateCreated: entry.meta.createdAt,
            dateModified: entry.meta.updatedAt,
            datePublished: entry.meta.publishedAt,
            author: source.author ? { name: source.author.name, url: source.author.url } : null,
            basedOn: source.url,
            images: entry.examples.map((example) => ({ url: absoluteUrl(mediaUrl(entry.meta.slug, example.src)), width: example.width, height: example.height, caption: example.caption?.[locale] ?? example.alt[locale] })),
          }),
        ]}
      />
      <PromptDetail entry={entry} locale={locale} variant="page" />
    </div>
  );
}
