/**
 * [INPUT]: Stage-bounded responsive WebP candidates, React image state and translated failure copy.
 * [OUTPUT]: ExampleImage with reserved proportions, native lazy loading, actual-source notification and one silent retry.
 * [POS]: Shared gallery/detail image renderer; static derivatives bypass hosted-optimizer failures without replacing sources.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ImageOff } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { responsiveImage, type ImageStage } from "@/lib/images/variants";
import { cn } from "@/lib/utils";

type ExampleImageProps = {
  src: string;
  width: number;
  height: number;
  alt: string;
  sizes: string;
  eager?: boolean;
  unoptimized?: boolean;
  className?: string;
  fit?: "cover" | "contain";
  stage?: ImageStage;
  onReady?: (src: string) => void;
};

export function ExampleImage({ src, width, height, alt, sizes, eager, unoptimized, className, fit = "cover", stage = "preview", onReady }: ExampleImageProps) {
  const t = useTranslations("gallery");
  const [failed, setFailed] = useState(false);
  // One silent retry absorbs transient errors (a dropped or failed static-media request) before admitting failure.
  const [attempt, setAttempt] = useState(0);
  const fail = () => {
    if (attempt === 0) setTimeout(() => setAttempt(1), 800);
    else setFailed(true);
  };

  if (failed) {
    return (
      <div role="img" aria-label={`${alt} — ${t("imageFailed")}`} style={{ aspectRatio: `${width} / ${height}` }} className={cn("grid w-full place-items-center bg-muted text-muted-foreground", className)}>
        <span className="flex flex-col items-center gap-2 px-4 text-center text-xs">
          <ImageOff className="size-5" aria-hidden />
          {t("imageFailed")}
        </span>
      </div>
    );
  }
  const sources = unoptimized ? { src } : responsiveImage(src, width, stage);
  return (
    // eslint-disable-next-line @next/next/no-img-element -- build-time WebP candidates are already optimized and bounded by display stage
    <img
      key={attempt}
      {...sources}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes}
      decoding="async"
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      onError={fail}
      onLoad={(event) => onReady?.(event.currentTarget.currentSrc)}
      // An error that fired before hydration is missed by onError; detect it from the element state instead.
      ref={(node) => {
        if (node?.complete && node.naturalWidth === 0 && node.currentSrc) fail();
        if (node?.complete && node.naturalWidth > 0) onReady?.(node.currentSrc);
      }}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn("h-auto w-full bg-muted", fit === "contain" ? "object-contain" : "object-cover", className)}
    />
  );
}
