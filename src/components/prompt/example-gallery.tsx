/**
 * [INPUT]: 依赖 @/components/gallery/example-image，依赖 radix-ui Dialog 作大图层
 * [OUTPUT]: 对外提供 ExampleGallery 客户端组件与 ExampleView 类型
 * [POS]: components/prompt 的图片区：图片即左栏（满铺 cover、按图片比例定宽），缩略图、来源链接与“完整图/撑满”切换悬浮其上，可放大；参数变化绝不替换或伪造图片
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ExternalLink, ImageIcon, Maximize2, Minimize2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useCallback, useEffect, useRef, useState } from "react";
import { ExampleImage } from "@/components/gallery/example-image";
import { cn } from "@/lib/utils";

export type ExampleView = {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  sourceUrl: string;
};

/**
 * The image *is* the left pane: edge to edge, cover-fit, sized by the parent to its own aspect ratio,
 * with thumbnails and the source link floating on top instead of taking layout space.
 */
export function ExampleGallery({ examples, unoptimized, className }: { examples: ExampleView[]; unoptimized: boolean; className?: string }) {
  const t = useTranslations("detail");
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  // "cover" fills the pane edge to edge; "contain" shows the whole image over a blurred copy of itself.
  const [fit, setFit] = useState<"cover" | "contain">("cover");
  const current = examples[index];

  if (!current) {
    return (
      <div className={cn("grid aspect-square place-items-center bg-muted/70 px-8 text-center text-sm text-muted-foreground", className)}>
        <span className="flex flex-col items-center gap-2">
          <ImageIcon className="size-6" aria-hidden />
          {t("noExamples")}
        </span>
      </div>
    );
  }

  const glass = "bg-black/35 text-white ring-1 ring-white/10 backdrop-blur-md";
  return (
    <figure className={cn("relative overflow-hidden bg-muted", className)} style={{ aspectRatio: `${current.width} / ${current.height}` }}>
      {fit === "contain" && (
        // eslint-disable-next-line @next/next/no-img-element -- decorative blurred backdrop reuses the already-loaded image
        <img src={current.src} alt="" aria-hidden className="absolute inset-0 size-full scale-110 object-cover opacity-70 blur-2xl" />
      )}
      <button type="button" onClick={() => setZoomed(true)} className="absolute inset-0 cursor-zoom-in" aria-label={`${t("viewLarge")}: ${current.alt}`}>
        <ExampleImage
          fit={fit}
          key={current.id}
          src={current.src}
          width={current.width}
          height={current.height}
          alt={current.alt}
          eager={index === 0}
          unoptimized={unoptimized}
          sizes="(max-width: 767px) 100vw, 60vw"
          className="h-full w-full bg-transparent"
        />
      </button>

      <button
        type="button"
        onClick={() => setFit(fit === "cover" ? "contain" : "cover")}
        aria-pressed={fit === "contain"}
        className={cn("absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-black/50", glass)}
      >
        {fit === "cover" ? <Maximize2 className="size-3.5" aria-hidden /> : <Minimize2 className="size-3.5" aria-hidden />}
        {fit === "cover" ? t("fitFull") : t("fitFill")}
      </button>

      <figcaption className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
        {examples.length > 1 ? (
          <ThumbnailTray examples={examples} index={index} onSelect={setIndex} unoptimized={unoptimized} label={t("examples")} itemLabel={(n) => t("showExample", { index: n })} className={glass} />
        ) : (
          <span />
        )}
        <a
          href={current.sourceUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className={cn("pointer-events-auto inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors hover:bg-black/50", glass)}
        >
          {t("imageSource")}
          <ExternalLink className="size-3" aria-hidden />
        </a>
      </figcaption>

      <DialogPrimitive.Root open={zoomed} onOpenChange={setZoomed}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-[60] grid place-items-center overflow-auto bg-black/70 p-4 backdrop-blur-xl data-[state=open]:animate-in data-[state=open]:fade-in-0">
            <DialogPrimitive.Content
              aria-describedby={undefined}
              // Closing on our own keydown keeps Esc on the innermost layer even if the layer stack is momentarily out of order.
              onKeyDown={(event) => {
                if (event.key === "Escape") setZoomed(false);
              }}
              className="relative flex max-h-full max-w-full flex-col items-center gap-3 outline-none">
              <DialogPrimitive.Title className="sr-only">{`${t("lightboxTitle")}: ${current.alt}`}</DialogPrimitive.Title>
              <ExampleImage
                src={current.src}
                width={current.width}
                height={current.height}
                alt={current.alt}
                fit="contain"
                eager
                unoptimized={unoptimized}
                sizes="100vw"
                className="max-h-[calc(100dvh-6rem)] w-auto max-w-[min(100%,1400px)] rounded-lg bg-transparent"
              />
              <DialogPrimitive.Close className="grid size-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={t("close")}>
                <X className="size-5" aria-hidden />
              </DialogPrimitive.Close>
            </DialogPrimitive.Content>
          </DialogPrimitive.Overlay>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </figure>
  );
}

/**
 * Thumbnails that never outgrow the image: the tray shrinks to the free width, scrolls sideways
 * (touch, trackpad or mouse wheel) and fades on whichever side still hides more examples.
 */
function ThumbnailTray({
  examples,
  index,
  onSelect,
  unoptimized,
  label,
  itemLabel,
  className,
}: {
  examples: ExampleView[];
  index: number;
  onSelect: (index: number) => void;
  unoptimized: boolean;
  label: string;
  itemLabel: (index: number) => string;
  className: string;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const node = scroller.current;
    if (!node) return;
    const max = node.scrollWidth - node.clientWidth;
    setEdges({ start: node.scrollLeft > 1, end: node.scrollLeft < max - 1 });
  }, []);

  useEffect(() => {
    const node = scroller.current;
    if (!node) return;
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    // A vertical wheel scrolls the tray sideways so mouse users can reach every example.
    const onWheel = (event: WheelEvent) => {
      if (node.scrollWidth <= node.clientWidth || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();
      node.scrollLeft += event.deltaY;
    };
    node.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      observer.disconnect();
      node.removeEventListener("wheel", onWheel);
    };
  }, [measure]);

  useEffect(() => {
    scroller.current?.children[index]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }, [index]);

  const fade = 28;
  const mask =
    edges.start || edges.end
      ? `linear-gradient(to right, ${edges.start ? "transparent" : "black"} 0, black ${edges.start ? fade : 0}px, black calc(100% - ${edges.end ? fade : 0}px), ${edges.end ? "transparent" : "black"} 100%)`
      : undefined;

  return (
    <div className={cn("pointer-events-auto min-w-0 rounded-full p-1.5", className)}>
      <div
        ref={scroller}
        role="group"
        aria-label={label}
        onScroll={measure}
        style={{ maskImage: mask, WebkitMaskImage: mask }}
        className="flex snap-x gap-1.5 overflow-x-auto rounded-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {examples.map((example, itemIndex) => (
          <button
            key={example.id}
            type="button"
            aria-pressed={itemIndex === index}
            aria-label={itemLabel(itemIndex + 1)}
            onClick={() => onSelect(itemIndex)}
            className={cn("size-10 shrink-0 snap-start overflow-hidden rounded-full ring-2 ring-transparent ring-inset transition sm:size-11", itemIndex === index ? "ring-white" : "opacity-60 hover:opacity-90")}
          >
            <ExampleImage src={example.src} width={example.width} height={example.height} alt="" sizes="44px" unoptimized={unoptimized} className="size-full" />
          </button>
        ))}
      </div>
    </div>
  );
}
