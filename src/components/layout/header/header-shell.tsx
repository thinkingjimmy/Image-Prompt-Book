/**
 * [INPUT]: 依赖 react 的 useEffect/useState
 * [OUTPUT]: 对外提供 HeaderShell 客户端组件
 * [POS]: components/layout/header 的吸顶外壳，渲染 <header> 并在页面滚动后标记 data-scrolled，供 site-header 内的按钮与胶囊切换为半透明
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useEffect, useState, type ReactNode } from "react";

export function HeaderShell({ children }: { children: ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Read once on mount too: a restored scroll position must not start opaque.
    const update = () => setScrolled(window.scrollY > 4);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header data-scrolled={scrolled || undefined} className="group/header sticky top-0 z-30">
      {children}
    </header>
  );
}
