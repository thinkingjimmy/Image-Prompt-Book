/**
 * [INPUT]: 依赖 Parallel Routes 的 @modal 插槽
 * [OUTPUT]: 默认导出 (site) 布局：children + modal
 * [POS]: app/[locale]/(site) 的路由弹窗宿主；列表留在 children，拦截的详情渲染到 modal
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { ReactNode } from "react";

export default function SiteLayout({ children, modal }: { children: ReactNode; modal: ReactNode }) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
