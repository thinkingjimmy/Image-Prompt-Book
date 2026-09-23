/**
 * [INPUT]: 依赖 @/lib/content 的 PromptEntry/contentFor，依赖同目录 ExampleGallery/ModalTitle 与 workbench/ 的 PromptStateProvider/CustomizeView/PromptActions，依赖 @/components/ui/scroll-area
 * [OUTPUT]: 对外提供 PromptDetail 服务端组件与 toPromptData()（服务端 → 客户端的最小可序列化数据）
 * [POS]: components/prompt 的共用详情（参考 ImageFX）：左栏为按比例满铺的案例图；右栏标题 + 作者/许可/参考图一行 + Prompt 工具行 + 可编辑 Prompt（自绘滚动）+ 主操作。独立页与弹窗同一组件，只以 variant 区分尺寸与标题元素
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ArrowLeft, ImagePlus } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { CSSProperties } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { contentFor } from "@/lib/content/catalog";
import type { PromptEntry } from "@/lib/content/load";
import { contentConfig, mediaUrl } from "@/lib/site";
import { cn } from "@/lib/utils";
import { ModalTitle } from "./detail-modal";
import { ExampleGallery, type ExampleView } from "./example-gallery";
import { CustomizeView } from "./workbench/customize-view";
import { PromptActions } from "./workbench/prompt-actions";
import { PromptStateProvider, type PromptData } from "./workbench/prompt-state";

const LICENSE_NAMES: Record<string, string> = { "CC-BY-NC-4.0": "CC BY-NC 4.0", MIT: "MIT" };
/** Keep in sync with `md:w-[440px]` below (Tailwind needs the literal class). */
const RIGHT_COLUMN = 440;

export function toPromptData(entry: PromptEntry, locale: Locale): PromptData {
  return {
    slug: entry.meta.slug,
    templateVersion: entry.meta.templateVersion,
    uiLocale: locale,
    outputLocales: entry.meta.outputLocales,
    parameters: entry.parameters,
    parameterLabels: contentFor(entry, locale).parameterLabels,
    // Only the site language is ever shown or copied, so only its template crosses to the client.
    templates: { [locale]: entry.templates[locale] },
    attribution: entry.attribution[locale] ?? "",
  };
}

function toExampleViews(entry: PromptEntry, locale: Locale): ExampleView[] {
  return entry.examples.map((example) => ({
    id: example.id,
    src: mediaUrl(example.src),
    width: example.width,
    height: example.height,
    alt: example.alt[locale],
    sourceUrl: example.sourceUrl,
  }));
}

export async function PromptDetail({ entry, locale, variant }: { entry: PromptEntry; locale: Locale; variant: "page" | "modal" }) {
  const t = await getTranslations({ locale, namespace: "detail" });
  const content = contentFor(entry, locale);
  const source = entry.meta.sources.find((item) => item.role === "original") ?? entry.meta.sources[0]!;
  const author = source.author;
  const cover = entry.examples[0];
  const title = <span className={cn("block text-xl leading-snug font-semibold tracking-tight text-balance", variant === "modal" && "pr-12 md:pr-10")}>{content.title}</span>;
  const link = "rounded-sm underline decoration-foreground/15 underline-offset-2 transition-colors hover:text-foreground hover:decoration-foreground/40";

  // On wide screens the image pane takes exactly the image's proportions at the detail height, so it never letterboxes.
  const frame = {
    "--ar": cover ? cover.width / cover.height : 1,
    "--detail-h": variant === "modal" ? "min(86dvh, 780px)" : "max(560px, calc(100dvh - 10rem))",
    "--left-max": variant === "modal" ? `calc(94vw - ${RIGHT_COLUMN}px)` : `calc(100% - ${RIGHT_COLUMN - 40}px)`,
  } as CSSProperties;

  return (
    <PromptStateProvider data={toPromptData(entry, locale)}>
      {variant === "page" && (
        <Link href="/" className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-sm text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" aria-hidden />
          {t("backToGallery")}
        </Link>
      )}
      <article style={frame} className={cn("flex flex-col md:h-[var(--detail-h)] md:flex-row", variant === "page" && "overflow-hidden rounded-[24px] bg-card ring-1 ring-black/[0.06]")}>
        <ExampleGallery
          examples={toExampleViews(entry, locale)}
          unoptimized={contentConfig().isFixture}
          className="w-full shrink-0 md:h-full md:w-[min(calc(var(--detail-h)*var(--ar)),var(--left-max))]"
        />

        <div className={cn("flex min-h-0 min-w-0 flex-col", variant === "modal" ? "md:w-[440px]" : "md:flex-1")}>
          <header className="flex flex-col gap-1.5 px-5 pt-5 pb-4 sm:px-6 md:pt-6">
            {variant === "modal" ? <ModalTitle>{title}</ModalTitle> : <h1>{title}</h1>}
            {/* The license requires credit wherever the adapted prompt is shown; it lives here, next to the title. */}
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
              <a href={author?.url ?? source.url} target="_blank" rel="noopener noreferrer nofollow" className={link}>
                {author?.name ?? source.title}
              </a>
              <span aria-hidden>·</span>
              <a href={entry.meta.rights.licenseUrl} target="_blank" rel="noopener noreferrer nofollow" className={link}>
                {LICENSE_NAMES[entry.meta.rights.promptLicense] ?? entry.meta.rights.promptLicense}
              </a>
              <span aria-hidden>·</span>
              <span>{t("adapted")}</span>
              {entry.meta.requiresReferenceImage && (
                <>
                  <span aria-hidden>·</span>
                  <span className="inline-flex items-center gap-1">
                    <ImagePlus className="size-3.5" aria-hidden />
                    {t("requiresReference")}
                  </span>
                </>
              )}
            </p>
          </header>

          <div className="mx-5 flex items-center justify-between border-t border-border/70 pt-2 sm:mx-6">
            <span className="text-xs font-medium tracking-wide text-muted-foreground">Prompt</span>
            <PromptActions part="tools" />
          </div>

          <ScrollArea className="md:flex-1" viewportClassName="px-5 pt-1 pb-6 sm:px-6">
            <CustomizeView />
          </ScrollArea>

          <div className="sticky bottom-0 z-10 border-t border-border/70 bg-background/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6 md:static md:bg-transparent md:pb-4 md:backdrop-blur-none">
            <PromptActions part="primary" />
          </div>
        </div>
      </article>
    </PromptStateProvider>
  );
}
