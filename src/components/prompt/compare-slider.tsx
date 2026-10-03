/**
 * [INPUT]: Shared CompareFrame/CompareHandle, localized labels and React pointer/keyboard state.
 * [OUTPUT]: CompareSlider with responsive image sizes, pointer dragging and keyboard control.
 * [POS]: Interactive detail comparison used by ExampleGallery when an example has a split input image.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { CompareFrame, CompareHandle, type CompareImage } from "@/components/gallery/compare-frame";
import { cn } from "@/lib/utils";

const STEP = 5;
const clamp = (value: number) => Math.min(100, Math.max(0, value));

export function CompareSlider({ before, after, eager, unoptimized, className, sizes }: { before: CompareImage; after: CompareImage; eager: boolean; unoptimized: boolean; className?: string; sizes: string }) {
  const t = useTranslations("detail");
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);
  const frame = useRef<HTMLDivElement>(null);

  const moveTo = (clientX: number) => {
    const rect = frame.current?.getBoundingClientRect();
    if (rect && rect.width > 0) setPosition(clamp(((clientX - rect.left) / rect.width) * 100));
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
    moveTo(event.clientX);
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging) moveTo(event.clientX);
  };
  const stop = () => setDragging(false);
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const next = { ArrowLeft: position - STEP, ArrowDown: position - STEP, ArrowRight: position + STEP, ArrowUp: position + STEP, Home: 0, End: 100 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setPosition(clamp(next));
  };

  const pill = "pointer-events-none absolute top-3 rounded-full bg-black/35 px-2.5 py-1 text-xs font-medium text-white ring-1 ring-white/10 backdrop-blur-md";
  return (
    <div
      ref={frame}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stop}
      onPointerCancel={stop}
      // Horizontal drags compare; vertical swipes still scroll the page on touch screens.
      className={cn("absolute inset-0 touch-pan-y select-none", dragging ? "cursor-grabbing" : "cursor-ew-resize", className)}
      data-testid="compare-slider"
    >
      <CompareFrame
        before={before}
        after={after}
        position={position}
        sizes={sizes}
        eager={eager}
        unoptimized={unoptimized}
        className="size-full"
        handle={
          <div
            role="slider"
            tabIndex={0}
            aria-label={t("compare")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(position)}
            aria-valuetext={t("compareValue", { value: Math.round(position) })}
            onKeyDown={onKeyDown}
            className="absolute inset-y-0 w-12 -translate-x-1/2 rounded-full outline-none focus-visible:[&>span]:ring-2 focus-visible:[&>span]:ring-white focus-visible:[&>span]:ring-offset-2 focus-visible:[&>span]:ring-offset-black/40"
            style={{ left: `${position}%` }}
          >
            <CompareHandle position={50} className={cn("transition-transform duration-150", dragging && "scale-110")} />
          </div>
        }
      >
        <span className={cn(pill, "left-3 transition-opacity", position < 12 && "opacity-0")}>{t("compareBefore")}</span>
        <span className={cn(pill, "right-3 transition-opacity", position > 88 && "opacity-0")}>{t("compareAfter")}</span>
      </CompareFrame>
    </div>
  );
}
