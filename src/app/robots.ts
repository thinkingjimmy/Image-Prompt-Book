/**
 * [INPUT]: 依赖 @/lib/site 的 absoluteUrl/isProductionDeploy
 * [OUTPUT]: 默认导出 robots.txt
 * [POS]: app 的爬虫入口；不屏蔽筛选页（爬虫需读取其 noindex），非生产部署通过 X-Robots-Tag 与 meta 统一 noindex
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { MetadataRoute } from "next";
import { absoluteUrl, isProductionDeploy } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    ...(isProductionDeploy() ? { sitemap: absoluteUrl("/sitemap.xml") } : {}),
  };
}
