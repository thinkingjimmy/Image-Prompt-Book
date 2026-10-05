# src/lib/

> L2 | 父级: ../../AGENTS.md

成员清单
site.ts: 站点配置单一入口（SITE_URL、部署与内容/fixture 隔离、isAnalyticsEnabled 及正式统计 origin、草稿预览、媒体与仓库 URL、专题策展人 CURATOR_NAME）
images/: Build-time Sharp WebP candidates, content fingerprints and display-stage limits (see images/README.md)
utils.ts: cn() 类名合并
content/: 内容 schema、加载与跨文件校验、发布谓词、搜索筛选分页、专题合集（见 content/README.md）
prompt/: 模板解析与 composePrompt、分享 hash、草稿、剪贴板、弹窗来源记录（见 prompt/README.md）
seo/: URL 规范、metadata、结构化数据（见 seo/README.md）
analytics/: UTM/click 归因白名单与仅含标识的使用事件，独立于列表语义和 SEO canonical（见 analytics/README.md）

[PROTOCOL]: Update this header when making changes, then check README.md.
