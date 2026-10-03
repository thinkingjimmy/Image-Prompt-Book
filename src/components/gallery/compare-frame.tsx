/**
 * [INPUT]: Shared ExampleImage, stage limits and decorative handle icons.
 * [OUTPUT]: CompareFrame, CompareHandle and CompareImage for static or interactive split comparisons.
 * [POS]: Gallery comparison renderer reused by cards and the detail slider with caller-supplied sizes and image stage.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { ImageStage } from "@/lib/images/variants";
import { ExampleImage } from "./example-image";

export type CompareImage = { src: string; width: number; height: number; alt: string };

type CompareFrameProps = {
  before: CompareImage;
  after: CompareImage;
  /** Divider position from the left edge, 0–100. */
  position: number;
  sizes: string;
  eager?: boolean;
  unoptimized?: boolean;
  className?: string;
  /** The handle element; the interactive slider passes a focusable one, the card a decorative one. */
  handle?: ReactNode;
  children?: ReactNode;
  stage?: ImageStage;
};

/** The result fills the frame; the input photo is clipped to the left of the divider, so both share one frame and line up. */
export function CompareFrame({ before, after, position, sizes, eager, unoptimized, className, handle, children, stage }: CompareFrameProps) {
  return (
    <div className={cn("relative overflow-hidden", className)} style={{ aspectRatio: `${after.width} / ${after.height}` }}>
      <ExampleImage src={after.src} width={after.width} height={after.height} alt={after.alt} sizes={sizes} eager={eager} unoptimized={unoptimized} stage={stage} className="size-full" />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <ExampleImage src={before.src} width={before.width} height={before.height} alt={before.alt} sizes={sizes} eager={eager} unoptimized={unoptimized} stage={stage} className="size-full" />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.35)]" style={{ left: `${position}%` }} />
      {handle ?? <CompareHandle position={position} />}
      {children}
    </div>
  );
}

/** The round handle on the divider; decorative unless the caller wraps it in something focusable. */
export function CompareHandle({ position, className }: { position: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute top-1/2 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/15 text-white shadow-[0_0_8px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:size-11",
        className,
      )}
      style={{ left: `${position}%` }}
    >
      <span className="flex items-center">
        <ChevronLeft className="size-3.5 sm:size-4" strokeWidth={2.5} />
        <ChevronRight className="size-3.5 sm:size-4" strokeWidth={2.5} />
      </span>
    </span>
  );
}
