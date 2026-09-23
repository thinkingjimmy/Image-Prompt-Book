/**
 * [INPUT]: 依赖 react 的 ref/state/effect，依赖 @/lib/utils 的 cn
 * [OUTPUT]: 对外提供 ScrollArea（原生滚动 + 自绘细滚动条：滚动/悬停时淡入、可拖拽、可点击轨道）
 * [POS]: components/ui 的自定义滚动容器，被详情弹窗与 Prompt 面板使用；保留原生滚动的键盘、触控与惯性，只替换系统滚动条外观
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const INSET = 4;
const MIN_THUMB = 28;

type Thumb = { size: number; offset: number };

export function ScrollArea({ children, className, viewportClassName, contentClassName }: { children: ReactNode; className?: string; viewportClassName?: string; contentClassName?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drag = useRef<{ startY: number; startTop: number } | null>(null);
  const [thumb, setThumb] = useState<Thumb>({ size: 0, offset: 0 });
  const [active, setActive] = useState(false);

  const measure = useCallback(() => {
    const node = viewport.current;
    if (!node) return;
    const track = node.clientHeight - INSET * 2;
    const scrollable = node.scrollHeight - node.clientHeight;
    if (scrollable <= 1) return setThumb({ size: 0, offset: 0 });
    const size = Math.max(MIN_THUMB, (node.clientHeight / node.scrollHeight) * track);
    setThumb({ size, offset: (node.scrollTop / scrollable) * (track - size) });
  }, []);

  const reveal = useCallback(() => {
    setActive(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => !drag.current && setActive(false), 900);
  }, []);

  useEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (viewport.current) observer.observe(viewport.current);
    if (content.current) observer.observe(content.current);
    return () => {
      observer.disconnect();
      clearTimeout(hideTimer.current);
    };
  }, [measure]);

  /** Converts a thumb movement in pixels into a scroll distance. */
  const scrollPerPixel = () => {
    const node = viewport.current!;
    const track = node.clientHeight - INSET * 2;
    return (node.scrollHeight - node.clientHeight) / Math.max(1, track - thumb.size);
  };

  return (
    <div className={cn("group/scroll relative min-h-0", className)} onPointerEnter={reveal}>
      <div
        ref={viewport}
        onScroll={() => {
          measure();
          reveal();
        }}
        className={cn("h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", viewportClassName)}
      >
        <div ref={content} className={contentClassName}>
          {children}
        </div>
      </div>
      {thumb.size > 0 && (
        <div
          aria-hidden
          className="absolute top-0 right-0 bottom-0 w-3 cursor-pointer"
          onPointerDown={(event) => {
            // Clicking the track pages toward the pointer, like a native scrollbar.
            if (event.target !== event.currentTarget || !viewport.current) return;
            const rect = event.currentTarget.getBoundingClientRect();
            const direction = event.clientY - rect.top < INSET + thumb.offset ? -1 : 1;
            viewport.current.scrollBy({ top: direction * viewport.current.clientHeight * 0.9, behavior: "smooth" });
          }}
        >
          <div
            data-scroll-thumb
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              drag.current = { startY: event.clientY, startTop: viewport.current?.scrollTop ?? 0 };
              setActive(true);
            }}
            onPointerMove={(event) => {
              if (!drag.current || !viewport.current) return;
              viewport.current.scrollTop = drag.current.startTop + (event.clientY - drag.current.startY) * scrollPerPixel();
            }}
            onPointerUp={() => {
              drag.current = null;
              reveal();
            }}
            style={{ height: thumb.size, transform: `translateY(${INSET + thumb.offset}px)` }}
            className={cn(
              "absolute top-0 right-[3px] w-1.5 rounded-full bg-foreground/25 transition-[opacity,width,background-color] duration-200 hover:w-2 hover:bg-foreground/40",
              active ? "opacity-100" : "opacity-0 group-hover/scroll:opacity-60",
            )}
          />
        </div>
      )}
    </div>
  );
}
