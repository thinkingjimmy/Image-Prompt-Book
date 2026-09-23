/**
 * [INPUT]: 依赖 ./static-copy 的 STATIC_COPY，依赖 @/lib/seo 的 pageMetadata/staticPath，依赖 next-intl/server
 * [OUTPUT]: 对外提供 StaticPageView 服务端组件与 staticPageMetadata()
 * [POS]: components/pages 的说明页渲染器，被 about/contribute/licenses 三个路由复用
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ExternalLink } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/config";
import { pageMetadata } from "@/lib/seo/metadata";
import { staticPath, type StaticPage } from "@/lib/seo/urls";
import { STATIC_COPY } from "./static-copy";

export async function staticPageMetadata(page: StaticPage, locale: Locale): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "pages" });
  return pageMetadata({ locale, title: `${t(`${page}Title`)} | Image Prompt Book`, description: t(`${page}Description`), path: staticPath(page) });
}

export async function StaticPageView({ page, locale }: { page: StaticPage; locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "pages" });
  const copy = STATIC_COPY[page][locale];
  return (
    <article className="mx-auto max-w-2xl px-4 pt-10 pb-8 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">{t(`${page}Title`)}</h1>
      <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">{copy.lead}</p>
      {copy.sections.map((section) => (
        <section key={section.heading} className="mt-9">
          <h2 className="text-lg font-semibold tracking-tight">{section.heading}</h2>
          {section.paragraphs?.map((paragraph) => (
            <p key={paragraph} className="mt-2.5 leading-relaxed text-foreground/85">
              {paragraph}
            </p>
          ))}
          {section.items && (
            <ol className="mt-2.5 list-decimal space-y-1.5 pl-5 leading-relaxed text-foreground/85 marker:text-muted-foreground">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          )}
          {section.links && (
            <div className="mt-3 flex flex-wrap gap-2">
              {section.links.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-card px-3.5 text-sm font-medium transition-colors hover:border-foreground/30"
                >
                  {link.label}
                  <ExternalLink className="size-3.5 text-muted-foreground" aria-hidden />
                </a>
              ))}
            </div>
          )}
        </section>
      ))}
    </article>
  );
}
