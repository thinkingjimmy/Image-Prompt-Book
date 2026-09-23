/**
 * [INPUT]: 依赖 next/image，依赖 next-intl 的 useTranslations
 * [OUTPUT]: 对外提供 ExampleImage（固定宽高比预留空间；加载失败时静默重试一次，仍失败才保留布局并显示真实失败提示）
 * [POS]: components/gallery 的图片单元，被卡片与详情图片区共用；不替换成其他案例图
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
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
};

export function ExampleImage({ src, width, height, alt, sizes, eager, unoptimized, className, fit = "cover" }: ExampleImageProps) {
  const t = useTranslations("gallery");
  const [failed, setFailed] = useState(false);
  // One silent retry absorbs transient errors (a cold image optimizer, a dropped request) before admitting failure.
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
  return (
    <Image
      key={attempt}
      src={src}
      width={width}
      height={height}
      alt={alt}
      sizes={sizes}
      unoptimized={unoptimized}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      onError={fail}
      // An error that fired before hydration is missed by onError; detect it from the element state instead.
      ref={(node) => {
        if (node?.complete && node.naturalWidth === 0 && node.currentSrc) fail();
      }}
      style={{ aspectRatio: `${width} / ${height}` }}
      className={cn("h-auto w-full bg-muted", fit === "contain" ? "object-contain" : "object-cover", className)}
    />
  );
}
