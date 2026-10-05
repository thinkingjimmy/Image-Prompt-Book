/**
 * [INPUT]: A visible prompt entry and its collection copy, localized prompt/collection messages, content-versioned images, ExampleImage and CardLink.
 * [OUTPUT]: CollectionMember — one section per prompt: 12px-rounded first example plus up to three thumbnails, title, original author, editorial "why", good for / not for, what can be adjusted and a link into the editable detail.
 * [POS]: The editorial core of a collection page (what the category grid lacks); every link is a real detail anchor that opens the routed modal like a gallery card.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { contentFor } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";
import type { CollectionContent } from "@/lib/content/schema";
import { optimizedMediaUrl } from "@/lib/images/source";
import { promptPath } from "@/lib/seo/urls";
import { contentConfig } from "@/lib/site";
import { CardLink } from "@/components/gallery/card-link";
import { ExampleImage } from "@/components/gallery/example-image";

export async function CollectionMember({ entry, copy, locale, eager }: { entry: PromptEntry; copy: CollectionContent["members"][string]; locale: Locale; eager: boolean }) {
  const t = await getTranslations({ locale, namespace: "collections" });
  const content = contentFor(entry, locale);
  const href = promptPath(entry.meta.slug);
  const source = entry.meta.sources.find((item) => item.role === "original") ?? entry.meta.sources[0]!;
  const [main, ...rest] = entry.examples.slice(0, 4);
  const unoptimized = contentConfig().isFixture;

  return (
    <section id={`prompt-${entry.meta.slug}`} aria-labelledby={`prompt-${entry.meta.slug}-title`} className="mt-7 grid scroll-mt-24 gap-4 min-[900px]:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-8">
      <div className={rest.length ? "grid grid-cols-[3fr_1fr] items-start gap-2" : undefined}>
        {main && (
          <CardLink href={href} tabIndex={-1} aria-hidden className="row-span-3 block overflow-hidden rounded-lg bg-muted ring-1 ring-black/[0.06]">
            <ExampleImage
              src={optimizedMediaUrl(entry.meta.slug, main.src, main.width)}
              width={main.width}
              height={main.height}
              alt={main.alt[locale]}
              sizes="(max-width: 899px) 75vw, 40vw"
              stage="preview"
              eager={eager}
              unoptimized={unoptimized}
            />
          </CardLink>
        )}
        {rest.map((example) => (
          <CardLink key={example.id} href={href} tabIndex={-1} aria-hidden className="block aspect-[3/4] overflow-hidden rounded-lg bg-muted ring-1 ring-black/[0.06]">
            <ExampleImage
              src={optimizedMediaUrl(entry.meta.slug, example.src, example.width)}
              width={example.width}
              height={example.height}
              alt={example.alt[locale]}
              sizes="(max-width: 899px) 25vw, 13vw"
              stage="card"
              unoptimized={unoptimized}
              className="h-full object-top"
            />
          </CardLink>
        ))}
      </div>

      <div>
        <h3 id={`prompt-${entry.meta.slug}-title`} className="text-lg leading-snug font-semibold tracking-tight sm:text-[19px]">
          <CardLink href={href} className="rounded-sm hover:underline hover:decoration-foreground/30 hover:underline-offset-4">
            {content.title}
          </CardLink>
        </h3>
        {source.author && <p className="mt-1.5 text-[13px] text-muted-foreground">{t("promptBy", { name: source.author.name })}</p>}
        <p className="mt-3 text-[15px] leading-relaxed">{copy.why}</p>
        <dl className="mt-4 grid gap-2.5 text-sm leading-relaxed sm:grid-cols-2">
          <div className="rounded-xl bg-card px-3 py-2.5 ring-1 ring-border ring-inset">
            <dt className="text-xs font-semibold text-muted-foreground">{t("goodFor")}</dt>
            <dd>{copy.goodFor}</dd>
          </div>
          <div className="rounded-xl bg-card px-3 py-2.5 ring-1 ring-border ring-inset">
            <dt className="text-xs font-semibold text-muted-foreground">{t("notFor")}</dt>
            <dd>{copy.notFor}</dd>
          </div>
        </dl>
        <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
          <span className="font-semibold text-foreground">{t("adjust")}</span> · {copy.adjust}
        </p>
        <CardLink
          href={href}
          aria-label={t("openLabel", { title: content.title })}
          className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-foreground px-4 text-sm font-semibold text-background transition-transform hover:-translate-y-px"
        >
          {t("open")}
          <ArrowRight className="size-4" aria-hidden />
        </CardLink>
      </div>
    </section>
  );
}
