# src/app/

> L2 | 父级: ../../AGENTS.md

App Router 路由树。根布局位于 `[locale]/`（使 `<html lang>` 随语言变化）；`/` → `/en` 的固定跳转在 `next.config.ts`。

成员清单
globals.css: Tailwind v4 主题 token（暖白、近黑、淡紫参数色）、`js:` 自定义变体、reduced-motion、`.masonry` 2/3/4/5 列布局（手机也是两列）
sitemap.ts: 由统一发布谓词生成各语言首页/分类/详情/说明页 + hreflang，lastmod 取内容真实 updatedAt
robots.ts: 允许抓取（筛选页需被读到 noindex），生产环境声明 sitemap
icon.png / apple-icon.png: 站点图标（叠放卡片 + 图片，与顶部 brand-mark 同源；apple 版铺页面底色）
[locale]/layout.tsx: 根布局，校验语言、NextIntlClientProvider、js 标记脚本、SiteHeader/SiteFooter
[locale]/not-found.tsx: 本地化 404（真实 404 状态）
[locale]/(site)/layout.tsx: children + @modal 并行插槽，承载拦截路由弹窗
[locale]/(site)/page.tsx: Gallery 首页 + generateMetadata（索引矩阵）
[locale]/(site)/categories/[category]/page.tsx: 分类 Gallery，仅有内容的分类可访问
[locale]/(site)/prompts/[slug]/page.tsx: 独立详情 + CreativeWork/Breadcrumb JSON-LD，旧 slug 308
[locale]/(site)/@modal/(.)prompts/[slug]/page.tsx: 被拦截的详情弹窗（与独立详情共用 PromptDetail 与 metadata）
[locale]/(site)/@modal/{default,page,[...rest]/page}.tsx: 空插槽分支，避免残留弹窗
[locale]/(site)/{default.tsx,[...rest]/page.tsx,error.tsx}: children 兜底 404、未知路径 404、可重试错误边界
[locale]/(site)/{about,contribute,licenses}/page.tsx: 说明页，内容来自 components/pages
media/[slug]/[file]/route.ts: 唯一图片通道 /media/<slug>/<file>，构建期预渲染，只提供可见条目在 examples.json 中登记的图片，其余 404

[PROTOCOL]: Update this header when making changes, then check README.md.
