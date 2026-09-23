/**
 * [INPUT]: 依赖 next/navigation 的 notFound
 * [OUTPUT]: 默认导出 children 插槽的兜底
 * [POS]: app/[locale]/(site) 的隐式 children 插槽 default；硬导航无法恢复时返回 404 而非空白
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { notFound } from "next/navigation";

export default function Default() {
  notFound();
}
