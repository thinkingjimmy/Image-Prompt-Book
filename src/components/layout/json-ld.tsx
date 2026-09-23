/**
 * [INPUT]: 依赖 @/lib/seo/structured-data 的 serializeJsonLd
 * [OUTPUT]: 对外提供 JsonLd 服务端组件
 * [POS]: components/layout 的结构化数据注入点，统一转义避免内容闭合 script
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { serializeJsonLd } from "@/lib/seo/structured-data";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
