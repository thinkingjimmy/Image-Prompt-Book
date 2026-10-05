/**
 * [INPUT]: Catalog collection/taxonomy data, localized messages, ModalTitle, CollectionMember and CollectionCard.
 * [OUTPUT]: CollectionView for standalone and intercepted details, with breadcrumb, accessible title, lead, grouped members and related collections.
 * [POS]: Shared editorial body for collection pages and routed modals; member links open the editable prompt detail.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ArrowRight, Layers } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { ModalTitle } from "@/components/prompt/detail-modal";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { collectionContentFor, getLibrary, getVisibleCollections, type CollectionView as View } from "@/lib/content/catalog";
import { categoryPath, collectionsPath } from "@/lib/seo/urls";
import { cn } from "@/lib/utils";
import { CollectionCard } from "./collection-card";
import { CollectionMember } from "./collection-member";

/** Same series first, then shared primary category, then newest. */
function related(view: View): View[] {
  const { series, categories } = view.collection.meta;
  const rank = (other: View) => (other.collection.meta.series === series ? 0 : other.collection.meta.categories.includes(categories[0]!) ? 1 : 2);
  return getVisibleCollections()
    .filter((other) => other.collection.meta.slug !== view.collection.meta.slug)
    .sort((a, b) => rank(a) - rank(b))
    .slice(0, 4);
}

export async function CollectionView({ view, locale, variant = "page" }: { view: View; locale: Locale; variant?: "page" | "modal" }) {
  const t = await getTranslations({ locale, namespace: "collections" });
  const pages = await getTranslations({ locale, namespace: "pages" });
  const content = collectionContentFor(view.collection, locale);
  const { meta } = view.collection;
  const primary = getLibrary().taxonomy.categories.find((category) => category.id === meta.categories[0])!;
  const others = related(view);
  let index = 0;

  return (
    <div className={cn("mx-auto w-full max-w-[1400px] px-4 pb-8 sm:px-6 lg:px-8", variant === "modal" ? "pt-14 md:pt-8" : "pt-2")}>
      <nav aria-label="Breadcrumb" className="mb-4 text-[13px] text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link href="/" className="rounded-sm hover:text-foreground">{pages("breadcrumbHome")}</Link></li>
          <li aria-hidden>/</li>
          <li><Link href={collectionsPath()} className="rounded-sm hover:text-foreground">{t("breadcrumb")}</Link></li>
          <li aria-hidden>/</li>
          <li aria-current="page" className="text-foreground">{content.title}</li>
        </ol>
      </nav>

      <header className="max-w-[680px]">
        <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <Layers className="size-3.5" aria-hidden />
          <Link href={{ pathname: collectionsPath(), query: { category: primary.id } }} className="rounded-sm hover:text-foreground">
            {t("categoryCollections", { category: primary.labels[locale] })}
          </Link>
          <span aria-hidden>·</span>
          <span>{t("count", { count: view.members.length })}</span>
        </p>
        {variant === "modal" ? (
          <ModalTitle><span className="mt-2 block text-[26px] leading-tight font-semibold tracking-tight text-balance md:text-[34px]">{content.heading}</span></ModalTitle>
        ) : (
          <h1 className="mt-2 text-[26px] leading-tight font-semibold tracking-tight text-balance md:text-[34px]">{content.heading}</h1>
        )}
        <p className="mt-4 text-base leading-relaxed">{content.lead}</p>
      </header>

      {view.groups.map((group) => (
        <section key={group.id} id={`group-${group.id}`} aria-labelledby={`group-${group.id}-title`} className="mt-10 scroll-mt-24 border-t border-border pt-6">
          <h2 id={`group-${group.id}-title`} className="text-xl font-semibold tracking-tight">{content.groups[group.id]!.title}</h2>
          <p className="mt-0.5 text-[13px] text-muted-foreground">{t("count", { count: group.members.length })}</p>
          {group.members.map((entry) => (
            <CollectionMember key={entry.meta.slug} entry={entry} copy={content.members[entry.meta.slug]!} locale={locale} eager={index++ === 0} />
          ))}
        </section>
      ))}

      <section aria-labelledby="more-title" className="mt-12 border-t border-border pt-6">
        {others.length > 0 && (
          <>
            <h2 id="more-title" className="mb-4 text-[17px] font-semibold tracking-tight">{t("more")}</h2>
            <ul className="grid grid-cols-2 gap-x-3 md:grid-cols-3 md:gap-x-5 xl:grid-cols-4">
              {others.map((other) => (
                <CollectionCard key={other.collection.meta.slug} view={other} locale={locale} headingLevel={3} />
              ))}
            </ul>
          </>
        )}
        <Link href={categoryPath(primary.id)} className="inline-flex items-center gap-1 rounded-sm text-sm underline decoration-border underline-offset-4 hover:decoration-foreground/40">
          <span id={others.length ? undefined : "more-title"}>{t("browseAll", { category: primary.labels[locale] })}</span>
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </section>
    </div>
  );
}
