/**
 * [INPUT]: 依赖同目录 ExampleImage，依赖 lucide-react 的向下箭头
 * [OUTPUT]: 对外提供 CompareStack（参考图在上、结果在下，两张都完整显示，接缝上是向下的圆形箭头）与 displayedAspect()
 * [POS]: components/gallery 的上下接缝，被 PromptCard 与 prompt/example-gallery 在 comparison 为 stack 时使用；左右擦除仍由 compare-frame / compare-slider 负责
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExampleImage } from "./example-image";
import type { CompareImage } from "./compare-frame";

type StackImage = { width: number; height: number; input?: { width: number; height: number } | null; comparison?: "split" | "stack" };

/** Width / height of the frame that shows this example. A stack is the two pictures one above the other. */
export function displayedAspect(image: StackImage): number {
  if (image.comparison === "stack" && image.input) {
    return 1 / (image.input.height / image.input.width + image.height / image.width);
  }
  return image.width / image.height;
}

/** Photo above, result below, both fully visible. The arrow marks the join; it is not a control. */
export function CompareStack({ before, after, sizes, eager, unoptimized, className }: { before: CompareImage; after: CompareImage; sizes: string; eager?: boolean; unoptimized?: boolean; className?: string }) {
  const photo = before.height / before.width;
  const result = after.height / after.width;
  const seam = (photo / (photo + result)) * 100;
  return (
    <div className={cn("relative isolate", className)}>
      {/* The photo sits one layer up so its lower edge casts onto the result instead of reading as one ripped picture. */}
      <div className="relative z-[1] shadow-[0_16px_22px_-14px_rgba(0,0,0,0.55)]">
        <ExampleImage src={before.src} width={before.width} height={before.height} alt={before.alt} sizes={sizes} eager={eager} unoptimized={unoptimized} />
      </div>
      <ExampleImage src={after.src} width={after.width} height={after.height} alt={after.alt} sizes={sizes} eager={eager} unoptimized={unoptimized} />
      <span
        aria-hidden
        className="pointer-events-none absolute left-1/2 z-10 grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-white bg-black/15 text-white shadow-[0_0_8px_rgba(0,0,0,0.3)] backdrop-blur-sm sm:size-11"
        style={{ top: `${seam}%` }}
      >
        <ArrowDown className="size-4 sm:size-[18px]" strokeWidth={2.25} />
      </span>
    </div>
  );
}
