/**
 * [INPUT]: 依赖 next/navigation 的 notFound
 * [OUTPUT]: 默认导出：任何未匹配的语言内路径返回本地化 404
 * [POS]: app/[locale]/(site) 的兜底路由（与 @modal/[...catchAll] 同级，避免歧义路由），让未知路径进入 [locale]/not-found 而非框架默认页
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { notFound } from "next/navigation";

export default function CatchAll() {
  notFound();
}
