/**
 * [INPUT]: Collection views from the catalog, localized collection copy, content-versioned image URLs, shared ExampleImage and modal-aware CardLink.
 * [OUTPUT]: CollectionCard (gallery/index card: stacked paper edges, 2×2 or 1+2 member cover mosaic, top-right "Collection" kicker, title and subtitle).
 * [POS]: The collection's entry point inside the image-first gallery; same width and radius as PromptCard so it reads as part of the grid, told apart only by structure.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { CardLink } from "@/components/gallery/card-link";
import { collectionContentFor, type CollectionView } from "@/lib/content/catalog";
import { optimizedMediaUrl } from "@/lib/images/source";
import { collectionPath } from "@/lib/seo/urls";
import { contentConfig } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ExampleImage } from "@/components/gallery/example-image";

const TILE_SIZES = "(max-width: 767px) 25vw, (max-width: 1023px) 17vw, (max-width: 1439px) 13vw, 164px";

export async function CollectionCard({ view, locale, headingLevel = 2 }: { view: CollectionView; locale: Locale; headingLevel?: 2 | 3 }) {
  const t = await getTranslations({ locale, namespace: "collections" });
  const content = collectionContentFor(view.collection, locale);
  const href = collectionPath(view.collection.meta.slug);
  const tiles = view.members.slice(0, view.members.length === 3 ? 3 : 4);
  const Heading = `h${headingLevel}` as const;

  return (
    <li data-collection-card className="mb-5 list-none sm:mb-7">
      <article className="group">
        {/* Two paper edges peek above the cover: this card is a set of prompts, not one. */}
        <div aria-hidden>
          <div className="mx-[18px] h-[5px] rounded-t-lg bg-border ring-1 ring-black/[0.05] ring-inset" />
          <div className="mx-[9px] h-[5px] rounded-t-lg bg-muted ring-1 ring-black/[0.05] ring-inset" />
        </div>
        <CardLink href={href} tabIndex={-1} aria-hidden className="relative block overflow-hidden rounded-lg bg-card shadow-[0_1px_2px_rgba(28,27,25,0.05)] ring-1 ring-black/[0.06]">
          <div className={cn("grid aspect-[4/5] grid-cols-2 gap-0.5", tiles.length === 3 ? "grid-rows-[1.3fr_1fr]" : "grid-rows-2")}>
            {tiles.map((entry, index) => {
              const cover = entry.examples[0]!;
              return (
                <div key={entry.meta.slug} className={cn("overflow-hidden bg-muted", tiles.length === 3 && index === 0 && "col-span-2")}>
                  <ExampleImage
                    src={optimizedMediaUrl(entry.meta.slug, cover.src, cover.width)}
                    width={cover.width}
                    height={cover.height}
                    alt=""
                    sizes={TILE_SIZES}
                    stage="card"
                    unoptimized={contentConfig().isFixture}
                    className="h-full w-full object-cover object-top transition-transform duration-300 ease-out group-hover:scale-[1.03]"
                  />
                </div>
              );
            })}
          </div>
          <span className="absolute top-2.5 right-2.5 inline-flex h-6 items-center gap-1 rounded-full bg-foreground px-2.5 text-xs font-semibold text-background">
            <Layers className="size-3" aria-hidden />
            {t("kicker")}
          </span>
        </CardLink>

        <div className="px-1 pt-2.5 sm:px-2 sm:pt-3.5">
          <Heading className="text-[15px] leading-snug font-semibold tracking-tight text-balance sm:text-[17px]">
            <CardLink href={href} className="rounded-sm hover:underline hover:decoration-foreground/30 hover:underline-offset-4">
              <span className="sr-only">{t("kicker")}: </span>
              {content.title}
            </CardLink>
          </Heading>
          <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{content.subtitle}</p>

        </div>
      </article>
    </li>
  );
}
