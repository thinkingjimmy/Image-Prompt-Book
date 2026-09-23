/**
 * [INPUT]: 依赖 @/lib/content 的 PromptEntry/contentFor，依赖同目录 ExampleGallery/ModalTitle 与 workbench/ 的 PromptStateProvider/CustomizeView/PromptActions，依赖 @/components/ui/scroll-area
 * [OUTPUT]: 对外提供 PromptDetail 服务端组件与 toPromptData()（服务端 → 客户端的最小可序列化数据）
 * [POS]: components/prompt 的共用详情（参考 ImageFX）：左栏为按比例满铺的案例图；右栏标题 + 作者·许可一行 + Prompt 工具行（版本切换 + 修改后出现的重置） + 可编辑 Prompt（自绘滚动）+ 主操作（复制 / ChatGPT / 分享）。独立页与弹窗同一组件，只以 variant 区分尺寸与标题元素
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
import { VariantTabs } from "./workbench/variant-tabs";

const LICENSE_NAMES: Record<string, string> = { "CC-BY-NC-4.0": "CC BY-NC 4.0", MIT: "MIT", "LicenseRef-AM-NonCommercial": "Non-commercial", "LicenseRef-Unspecified": "No license stated" };
/** Keep in sync with `md:w-[440px]` below (Tailwind needs the literal class). */
const RIGHT_COLUMN = 440;

export function toPromptData(entry: PromptEntry, locale: Locale): PromptData {
  return {
    slug: entry.meta.slug,
    uiLocale: locale,
    outputLocales: entry.meta.outputLocales,
    // Only the site language is ever shown or copied, so only its template crosses to the client.
    variants: entry.variants.map((variant) => ({
      id: variant.id,
      label: variant.labels?.[locale] ?? null,
      templateVersion: variant.templateVersion,
      parameters: variant.parameters,
      template: variant.templates[locale] ?? "",
    })),
    parameterLabels: contentFor(entry, locale).parameterLabels,
  };
}

function toExampleViews(entry: PromptEntry, locale: Locale): ExampleView[] {
  return entry.examples.map((example) => ({
    id: example.id,
    src: mediaUrl(entry.meta.slug, example.src),
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
  const title = <span className="block text-xl leading-snug font-semibold tracking-tight text-balance">{content.title}</span>;
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
      {/* overflow-clip (not hidden) rounds the card without becoming a scroll container, so the action bar can stay sticky. */}
      <article style={frame} className={cn("flex flex-col md:h-[var(--detail-h)] md:flex-row", variant === "page" && "overflow-clip rounded-[24px] bg-card ring-1 ring-black/[0.06]")}>
        <ExampleGallery
          examples={toExampleViews(entry, locale)}
          unoptimized={contentConfig().isFixture}
          className="w-full shrink-0 md:h-full md:w-[min(calc(var(--detail-h)*var(--ar)),var(--left-max))]"
        />

        <div className={cn("flex min-h-0 min-w-0 flex-col", variant === "modal" ? "md:w-[440px]" : "md:flex-1")}>
          <header className="flex flex-col gap-1.5 px-5 pt-5 pb-4 sm:px-6 md:pt-6">
            <div className={cn(variant === "modal" && "pr-10")}>{variant === "modal" ? <ModalTitle>{title}</ModalTitle> : <h1>{title}</h1>}</div>
            {/* The license requires credit wherever the adapted prompt is shown; it lives here, next to the title. */}
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] text-muted-foreground">
              <a href={author?.url ?? source.url} target="_blank" rel="noopener noreferrer nofollow" className={link}>
                {author?.name ?? source.title}
              </a>
              <span aria-hidden>·</span>
              <a href={entry.meta.rights.licenseUrl} target="_blank" rel="noopener noreferrer nofollow" className={link}>
                {LICENSE_NAMES[entry.meta.rights.promptLicense] ?? entry.meta.rights.promptLicense}
              </a>
            </p>
          </header>

          {/* The version switch separates this row on its own; single-version prompts get a divider instead. */}
          <div className={cn("mx-5 flex items-center justify-between sm:mx-6", entry.variants.length > 1 ? "h-9" : "h-11 border-t border-border/60 pt-1")}>
            <VariantTabs />
            <PromptActions part="reset" />
          </div>

          <ScrollArea className="md:flex-1" viewportClassName="px-5 pt-3 pb-6 sm:px-6">
            <CustomizeView />
          </ScrollArea>

          <div className="sticky bottom-0 z-10 border-t border-border/70 bg-background/95 px-5 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:px-6 md:static md:bg-transparent md:pb-4 md:backdrop-blur-none">
            {entry.meta.requiresReferenceImage && (
              // Placed where people act (copy / open ChatGPT), because forgetting the image is the most common failure.
              <p data-testid="attach-notice" className="mb-3 flex items-start gap-2.5 rounded-2xl bg-param px-3.5 py-2.5 text-[13px] leading-snug text-param-foreground">
                <ImagePlus className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>
                  <strong className="font-semibold">{t("attachTitle")}</strong> {t("attachBody")}
                </span>
              </p>
            )}
            <PromptActions part="primary" />
          </div>
        </div>
      </article>
    </PromptStateProvider>
  );
}
