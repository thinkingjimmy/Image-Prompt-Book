# src/components/gallery/

> L2 | 父级: ../../../AGENTS.md

成员清单
gallery-view.tsx: 列表主视图（首页/分类复用，H1 与简介仅供读屏/爬虫，图片紧接导航），resolveListing() 规范化查询并重定向非规范 URL，超范围页 404，空态/目录为空
prompt-card.tsx: 卡片（主图→标题→三行简介→≤3 标签→作者/来源），一个 Prompt 一张卡，+N 多图角标
card-link.tsx: 真实详情 anchor；普通左键记录“从列表打开”与触发元素，修饰键点击保持原生新标签
example-image.tsx: next/image 封装，aspect-ratio 预留空间，加载失败保留布局并显示真实失败提示（含水合前失败检测）
list-controls.tsx: TagFilters（AND 切换、规范顺序）、Pagination（rel=prev/next 真实链接）、EmptyState

[PROTOCOL]: Update this header when making changes, then check README.md.
