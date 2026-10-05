# src/lib/seo/

> L2 | 父级: ../README.md

成员清单
urls.ts: Locale-prefixed gallery/prompt/collection paths, About/Licenses StaticPage contract, listHref and localizedAlternates (self-canonical, actual translations and x-default).
metadata.ts: pageMetadata()/promptMetadata()/collectionMetadata()，按索引矩阵输出 canonical/robots/OG（en_US/zh_CN、大图卡片，无封面回退 /media/og.png，专题用封面成员示例图）；非生产部署一律 noindex
structured-data.ts: WebSite/CollectionPage/Article（专题：策展人 + 成员 ItemList）/BreadcrumbList/CreativeWork JSON-LD，不含评分或评论；CreativeWork 带 mainEntityOfPage，description 即页面可见摘要；imageCredit() 为案例图署名（本站复现→站点，作者示例→同账号来源的作者，推断不出则不输出），不虚构图片许可

[PROTOCOL]: Update this header when making changes, then check README.md.
