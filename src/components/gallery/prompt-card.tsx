/**
 * [INPUT]: 依赖 @/lib/content 的 PromptEntry/Taxonomy，依赖同目录 CardLink/ExampleImage，依赖 @/lib/site 的 mediaUrl
 * [OUTPUT]: 对外提供 PromptCard 服务端组件
 * [POS]: components/gallery 的卡片：主图 → 标题 → 两行简介 → 最多三个标签 → 作者/来源；一个 Prompt 只占一张卡片
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ImageIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { contentFor } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";
import type { Taxonomy } from "@/lib/content/schema";
import { contentConfig, mediaUrl } from "@/lib/site";
import { promptPath } from "@/lib/seo/urls";
import { CardLink } from "./card-link";
import { ExampleImage } from "./example-image";

const CARD_SIZES = "(max-width: 479px) 100vw, (max-width: 767px) 50vw, (max-width: 1023px) 33vw, (max-width: 1439px) 25vw, 20vw";

export async function PromptCard({ entry, locale, taxonomy, eager }: { entry: PromptEntry; locale: Locale; taxonomy: Taxonomy; eager: boolean }) {
  const t = await getTranslations({ locale, namespace: "gallery" });
  const content = contentFor(entry, locale);
  const href = promptPath(entry.meta.slug);
  const cover = entry.examples[0];
  const tags = taxonomy.tags.filter((tag) => entry.meta.tags.includes(tag.id)).slice(0, 3);
  const source = entry.meta.sources.find((item) => item.role === "original") ?? entry.meta.sources[0]!;
  const author = source.author;

  return (
    <li className="mb-7 list-none">
      <article className="group">
        <CardLink href={href} tabIndex={-1} aria-hidden className="relative block overflow-hidden rounded-[18px] bg-muted shadow-[0_1px_2px_rgba(28,27,25,0.05)] ring-1 ring-black/[0.06]">
          {cover ? (
            <ExampleImage
              src={mediaUrl(cover.src)}
              width={cover.width}
              height={cover.height}
              alt={cover.alt[locale]}
              sizes={CARD_SIZES}
              eager={eager}
              unoptimized={contentConfig().isFixture}
              className="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid aspect-square place-items-center text-muted-foreground">
              <span className="flex flex-col items-center gap-2 px-6 text-center text-xs">
                <ImageIcon className="size-5" aria-hidden />
                {t("noImage")}
              </span>
            </div>
          )}
          {entry.examples.length > 1 && (
            <span className="absolute top-2.5 right-2.5 rounded-full bg-black/60 px-2 py-0.5 text-xs font-medium text-white">
              <span aria-hidden>{t("moreImages", { count: entry.examples.length - 1 })}</span>
              <span className="sr-only">{t("moreImagesLabel", { count: entry.examples.length - 1 })}</span>
            </span>
          )}
        </CardLink>

        <div className="px-2 pt-3.5">
          <h2 className="text-[17px] leading-snug font-semibold tracking-tight text-balance [overflow-wrap:anywhere]">
            <CardLink href={href} className="rounded-sm hover:underline hover:decoration-foreground/30 hover:underline-offset-4">
              {content.title}
            </CardLink>
          </h2>
          <p className="mt-1.5 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground [overflow-wrap:anywhere]">{content.summary}</p>

          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {entry.meta.requiresReferenceImage && (
              <span className="rounded-full bg-param px-2 py-0.5 text-xs font-medium text-param-foreground">{t("requiresReference")}</span>
            )}
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={{ pathname: "/", query: { tags: tag.id } }}
                aria-label={t("tagFilter", { tag: tag.labels[locale] })}
                className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
              >
                {tag.labels[locale]}
              </Link>
            ))}
          </div>

          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground">
            {author ? (
              author.url ? (
                <a href={author.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-block rounded-sm py-1 hover:text-foreground hover:underline">
                  {t("by", { name: author.name })}
                </a>
              ) : (
                <span>{t("by", { name: author.name })}</span>
              )
            ) : null}
            {author && <span aria-hidden>·</span>}
            <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="inline-block rounded-sm py-1 hover:text-foreground hover:underline">
              {author ? new URL(source.url).hostname.replace(/^www\./, "") : t("sourceSite")}
            </a>
          </p>
        </div>
      </article>
    </li>
  );
}
