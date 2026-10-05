# src/app/

> L2 | 父级: ../../AGENTS.md

App Router 路由树。根布局位于 `[locale]/`（使 `<html lang>` 随语言变化）；`/` → `/en` 的固定跳转在 `next.config.ts`。

成员清单
globals.css: Tailwind v4 scanning scoped to src/, shared 12px corners, compact controls, viewport-fixed Canvas surface, keyboard focus modality, Geist-first sans typography with CJK system fallbacks and no synthesized styles, `js:` variant, reduced motion and container-based two-to-five-column masonry.
sitemap.ts: 由统一发布谓词生成各语言首页/分类/详情/专题列表与已发布专题/说明页 + hreflang，lastmod 取内容真实 updatedAt
robots.ts: 允许抓取（筛选页需被读到 noindex），生产环境声明 sitemap
icon.png / apple-icon.png: 站点图标（叠放卡片 + 图片，与顶部 brand-mark 同源；apple 版铺页面底色）
[locale]/layout.tsx: Root locale layout with optimized/self-hosted variable Geist from next/font/google, locale validation/provider, JS marker, warm sidebar/white Canvas shell, expandable search, compact Line footer and production analytics; pins data-footer-lead to the end of main.
[locale]/not-found.tsx: 本地化 404（真实 404 状态）
[locale]/(site)/layout.tsx: children + @modal 并行插槽，承载拦截路由弹窗
[locale]/(site)/page.tsx: Gallery 首页 + generateMetadata（索引矩阵）
[locale]/(site)/categories/[category]/page.tsx: 分类 Gallery，仅有内容的分类可访问
[locale]/(site)/collections/page.tsx: 专题列表；?category= 筛选 noindex，未知或空分类 307 回全部专题
[locale]/(site)/collections/[slug]/page.tsx: 专题页 + Article/ItemList/Breadcrumb JSON-LD，旧 slug 308
[locale]/(site)/prompts/[slug]/page.tsx: 独立详情 + CreativeWork/Breadcrumb JSON-LD，旧 slug 308
[locale]/(site)/@modal/(.)collections/[slug]/page.tsx: Native collection interception sharing CollectionView and metadata; member prompts open their native detail modal, browser Back returns to the collection.
[locale]/(site)/@modal/(.)prompts/[slug]/page.tsx: 被拦截的详情弹窗（与独立详情共用 PromptDetail 与 metadata）
[locale]/(site)/@modal/{default,page,[...rest]/page}.tsx: 空插槽分支，避免残留弹窗
[locale]/(site)/{default.tsx,[...rest]/page.tsx,error.tsx}: children 兜底 404、未知路径 404、可重试错误边界
[locale]/(site)/{about,licenses}/page.tsx: Static About/Licenses pages from components/pages; retired /contribute paths return 404 and are absent from the sitemap.
media/og.png/route.tsx: 站点分享图 1200×630（品牌 + 标语 + 已发布封面拼贴），构建期生成，无封面页面的 og:image
media/[slug]/[file]/route.ts: 唯一图片通道 /media/<slug>/<file>，构建期预渲染，只提供可见条目在 examples.json 中登记的图片（含 input 对比原图），Sharp 为每张登记图片预生成带内容版本的 WebP；原文件保持字节不变，未登记文件/版本/尺寸均 404

[PROTOCOL]: Update this header when making changes, then check README.md.
