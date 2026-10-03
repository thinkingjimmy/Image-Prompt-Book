/**
 * [INPUT]: Content/taxonomy, localized copy, content-versioned image URLs and shared card/comparison renderers.
 * [OUTPUT]: PromptCard with stage-bounded responsive images, layout-matched sizes and unchanged content/source links.
 * [POS]: One image-first card per prompt; registered comparisons keep their existing layout and reading order.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ImageIcon, ImagePlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { contentFor } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";
import type { Taxonomy } from "@/lib/content/schema";
import { contentConfig } from "@/lib/site";
import { optimizedMediaUrl } from "@/lib/images/source";
import { promptPath } from "@/lib/seo/urls";
import { CardLink } from "./card-link";
import { CompareFrame } from "./compare-frame";
import { CompareStack } from "./compare-stack";
import { ExampleImage } from "./example-image";

const tagClass = "inline-flex h-6 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border border-border bg-card/60 px-2.5 text-xs text-muted-foreground";
const CARD_SIZES = "(max-width: 479px) calc((100vw - 44px) / 2), (max-width: 639px) calc((100vw - 48px) / 2), (max-width: 767px) calc((100vw - 64px) / 2), (max-width: 1023px) calc((100vw - 88px) / 3), (max-width: 1439px) calc((100vw - 124px) / 4), (max-width: 1799px) calc((100vw - 160px) / 5), 328px";

export async function PromptCard({ entry, locale, taxonomy, eager }: { entry: PromptEntry; locale: Locale; taxonomy: Taxonomy; eager: boolean }) {
  const t = await getTranslations({ locale, namespace: "gallery" });
  const content = contentFor(entry, locale);
  const href = promptPath(entry.meta.slug);
  const cover = entry.examples[0];
  // The entry's own tag order decides what shows first on its card.
  const tags = entry.meta.tags.flatMap((id) => taxonomy.tags.filter((tag) => tag.id === id)).slice(0, 3);
  const source = entry.meta.sources.find((item) => item.role === "original") ?? entry.meta.sources[0]!;
  const author = source.author;

  return (
    <li className="mb-5 list-none sm:mb-7">
      <article className="group">
        <CardLink href={href} tabIndex={-1} aria-hidden className="relative block overflow-hidden rounded-[14px] bg-muted sm:rounded-[18px] shadow-[0_1px_2px_rgba(28,27,25,0.05)] ring-1 ring-black/[0.06]">
          {cover?.input && cover.comparison === "stack" ? (
            // Both pictures in full: the result is not a registered wipe of the photo.
            <CompareStack
              before={{ src: optimizedMediaUrl(entry.meta.slug, cover.input.src, cover.input.width), width: cover.input.width, height: cover.input.height, alt: cover.input.alt[locale] }}
              after={{ src: optimizedMediaUrl(entry.meta.slug, cover.src, cover.width), width: cover.width, height: cover.height, alt: cover.alt[locale] }}
              sizes={CARD_SIZES}
              stage="card"
              eager={eager}
              unoptimized={contentConfig().isFixture}
              className="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : cover?.input ? (
            // A static split at 50%: the card hints at the comparison, the detail page lets you drag it.
            <CompareFrame
              before={{ src: optimizedMediaUrl(entry.meta.slug, cover.input.src, cover.input.width), width: cover.input.width, height: cover.input.height, alt: cover.input.alt[locale] }}
              after={{ src: optimizedMediaUrl(entry.meta.slug, cover.src, cover.width), width: cover.width, height: cover.height, alt: cover.alt[locale] }}
              position={50}
              sizes={CARD_SIZES}
              stage="card"
              eager={eager}
              unoptimized={contentConfig().isFixture}
              className="transition-transform duration-300 ease-out group-hover:scale-[1.02]"
            />
          ) : cover ? (
            <ExampleImage
              src={optimizedMediaUrl(entry.meta.slug, cover.src, cover.width)}
              width={cover.width}
              height={cover.height}
              alt={cover.alt[locale]}
              sizes={CARD_SIZES}
              stage="card"
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

        <div className="px-1 pt-2.5 sm:px-2 sm:pt-3.5">
          <h2 className="text-[15px] leading-snug font-semibold tracking-tight text-balance [overflow-wrap:anywhere] sm:text-[17px]">
            <CardLink href={href} className="rounded-sm hover:underline hover:decoration-foreground/30 hover:underline-offset-4">
              {content.title}
            </CardLink>
          </h2>
          {/* One line only: extra tags are clipped behind a soft fade instead of wrapping. */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,black_85%,transparent)]">
            {entry.meta.requiresReferenceImage && (
              <span className={tagClass}>
                <ImagePlus className="size-3" aria-hidden />
                {t("requiresReference")}
              </span>
            )}
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={{ pathname: "/", query: { tags: tag.id } }}
                aria-label={t("tagFilter", { tag: tag.labels[locale] })}
                className={`${tagClass} transition-colors hover:border-foreground/30 hover:text-foreground`}
              >
                {tag.labels[locale]}
              </Link>
            ))}
          </div>

          {/* Only the author's name: one quiet line that links to their profile (or the source when unknown). */}
          <a
            href={author?.url ?? source.url}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="mt-2 inline-block rounded-sm py-0.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            {author?.name ?? t("sourceSite")}
          </a>
        </div>
      </article>
    </li>
  );
}
