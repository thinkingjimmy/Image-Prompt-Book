/**
 * [INPUT]: 依赖 react 的 ref/state/effect，依赖 @/lib/utils 的 cn
 * [OUTPUT]: 对外提供 ScrollArea（元素级滚动容器）与 PageScrollbar（整页滚动条），二者共用自绘细滚动条 ScrollThumb
 * [POS]: components/ui 的自研滚动条；保留原生滚动（键盘、触控、惯性、滚动恢复），只替换系统滚动条外观：滚动/悬停时淡入、可拖拽、可点击轨道
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const INSET = 4;
const MIN_THUMB = 28;

type Metrics = { top: number; scrollHeight: number; clientHeight: number };

/** Reads and drives either an element or the document (null). */
function metrics(node: HTMLElement | null): Metrics {
  if (node) return { top: node.scrollTop, scrollHeight: node.scrollHeight, clientHeight: node.clientHeight };
  const root = document.documentElement;
  return { top: window.scrollY, scrollHeight: root.scrollHeight, clientHeight: window.innerHeight };
}

function scrollTo(node: HTMLElement | null, top: number, smooth = false) {
  (node ?? window).scrollTo({ top, behavior: smooth ? "smooth" : "instant" });
}

function ScrollThumb({ target, observe, className }: { target: () => HTMLElement | null; observe: () => Element[]; className?: string }) {
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const drag = useRef<{ startY: number; startTop: number } | null>(null);
  const [thumb, setThumb] = useState({ size: 0, offset: 0 });
  const [active, setActive] = useState(false);

  const measure = useCallback(() => {
    const { top, scrollHeight, clientHeight } = metrics(target());
    const track = clientHeight - INSET * 2;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 1) return setThumb({ size: 0, offset: 0 });
    const size = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * track);
    setThumb({ size, offset: (Math.min(Math.max(top, 0), scrollable) / scrollable) * (track - size) });
  }, [target]);

  const reveal = useCallback(() => {
    setActive(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => !drag.current && setActive(false), 900);
  }, []);

  useEffect(() => {
    const node = target();
    const source: HTMLElement | Window = node ?? window;
    const onScroll = () => {
      measure();
      reveal();
    };
    // ResizeObserver reports once on observe, which also performs the first measurement.
    source.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    const observer = new ResizeObserver(measure);
    for (const element of observe()) observer.observe(element);
    return () => {
      source.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      observer.disconnect();
      clearTimeout(hideTimer.current);
    };
  }, [target, observe, measure, reveal]);

  if (thumb.size === 0) return null;
  /** Converts a thumb movement in pixels into a scroll distance. */
  const perPixel = () => {
    const { scrollHeight, clientHeight } = metrics(target());
    return (scrollHeight - clientHeight) / Math.max(1, clientHeight - INSET * 2 - thumb.size);
  };

  return (
    <div
      aria-hidden
      className={cn("group/thumb z-40 w-3 cursor-pointer", className)}
      onPointerEnter={reveal}
      onPointerDown={(event) => {
        // Clicking the track pages toward the pointer, like a native scrollbar.
        if (event.target !== event.currentTarget) return;
        const rect = event.currentTarget.getBoundingClientRect();
        const { top, clientHeight } = metrics(target());
        const direction = event.clientY - rect.top < INSET + thumb.offset ? -1 : 1;
        scrollTo(target(), top + direction * clientHeight * 0.9, true);
      }}
    >
      <div
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
          drag.current = { startY: event.clientY, startTop: metrics(target()).top };
          setActive(true);
        }}
        onPointerMove={(event) => {
          if (drag.current) scrollTo(target(), drag.current.startTop + (event.clientY - drag.current.startY) * perPixel());
        }}
        onPointerUp={() => {
          drag.current = null;
          reveal();
        }}
        style={{ height: thumb.size, transform: `translateY(${INSET + thumb.offset}px)` }}
        className={cn(
          "absolute top-0 right-[3px] w-1.5 rounded-full bg-foreground/25 transition-[opacity,width,background-color] duration-200 hover:w-2 hover:bg-foreground/40",
          active ? "opacity-100" : "opacity-0 group-hover/thumb:opacity-60",
        )}
      />
    </div>
  );
}

export function ScrollArea({ children, className, viewportClassName, contentClassName }: { children: ReactNode; className?: string; viewportClassName?: string; contentClassName?: string }) {
  const viewport = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const target = useCallback(() => viewport.current, []);
  const observe = useCallback(() => [viewport.current, content.current].filter((node): node is HTMLDivElement => Boolean(node)), []);

  return (
    <div className={cn("group/scroll relative min-h-0", className)}>
      <div ref={viewport} className={cn("h-full overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden", viewportClassName)}>
        <div ref={content} className={contentClassName}>
          {children}
        </div>
      </div>
      <ScrollThumb target={target} observe={observe} className="absolute top-0 right-0 bottom-0" />
    </div>
  );
}

/** The document keeps native scrolling; the system bar is hidden in globals.css and this thumb is drawn instead. */
export function PageScrollbar() {
  const target = useCallback(() => null, []);
  const observe = useCallback(() => [document.body], []);
  return <ScrollThumb target={target} observe={observe} className="fixed top-0 right-0 bottom-0" />;
}
