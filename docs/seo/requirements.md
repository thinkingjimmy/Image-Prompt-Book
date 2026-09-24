# SEO 优化需求

> 依据：[guidelines.md](./guidelines.md)。现状基于 2026-09-24 的 `main`（eb87d28），共 6 条已发布 prompt。
> 排序原则：先堵处罚风险，再补 E-E-A-T，最后做增量流量。每条需求都注明对应 guidelines 的哪一节。

## 现状：已经做对的（守住，不要回退）

- 每种语言各自 canonical，hreflang 只列真实存在的译文，`x-default` 指向英文。
- 筛选、排序、搜索页 `noindex,follow`；非生产环境全站 `noindex`。
- sitemap 只收已发布条目，`lastmod` 取内容真实的 `updatedAt`。
- 结构化数据不输出评分、评论、下载量；JSON-LD 转义了 `<`。
- prompt 正文服务端渲染，无 JS 时也可读。
- 弹窗只在确认从站内列表打开时才 `router.back()`；切换选项用 `replaceState`，不劫持返回键。
- 许可与作者署名紧挨标题；不知道的信息填 `null`；有 takedown 渠道。

---

## P0 · 上线即做

### R1. 连接 Google Search Console（§1、§3.4）

**状态（2026-09-24）**：网域资源已通过 DNS TXT 验证；sitemap 已提交，状态"成功"，已发现 26 个网页；已对 `/en/prompts/photo-abstract-editorial` 请求编入索引（进入优先抓取队列）；GA4 已关联，并已在 GA4 报告库发布 Search Console 集合。**R1 完成。**

**做法**：用**网域资源（Domain property）** `imagepromptbook.com`，通过 Spaceship 的 DNS TXT 记录验证。

**为什么用网域资源**：
- 不依赖页面代码：站点上线前、换部署方式后都有效（HTML 标签验证和 GA 验证都依赖线上页面）。
- 一个网域资源同时覆盖 `http`、`https`、`www` 和裸域，以后换托管平台也不用重新验证。
- 不需要改代码。

**上线后**：
1. 提交 `https://imagepromptbook.com/sitemap.xml`。
2. 用"网址检查"查首页、一个分类页、一个详情页（中英各一个），确认 Google 抓到的 HTML 里有 prompt 正文，并且 canonical 和 hreflang 正确。
3. 把 GA4（`G-9XPFRGZTK3`）和 Search Console 关联起来。

**验收**：Search Console 显示"已验证"；sitemap 状态为"成功"；网址检查显示"网址在 Google 上"或"可编入索引"。

### R2. 生产部署前的检查清单（§1.2 Sneaky redirects）

- 生产环境设置 `SITE_URL=https://imagepromptbook.com` 和 `IPB_DEPLOY_ENV=production`，其余环境一律不设。
- 只保留一个主机名：`www` 用 301/308 跳到裸域（或者反过来），和 `SITE_URL` 保持一致。
- `curl` 检查：`/robots.txt` 里有 `Sitemap:` 行；`/sitemap.xml` 里没有 `localhost` 或预览域名；生产页面没有 `noindex`。

**线上抽查（2026-09-24，curl）**：`/robots.txt` 含 `Sitemap:` 行；`/sitemap.xml` 共 26 条，全部是 `https://imagepromptbook.com`；`/en` 的 robots 为 `index, follow`，canonical 正确；`/` 用 307 跳到 `/en`（`next.config.ts` 中 `permanent: false`，这是按语言跳转的常规做法，保持不变）。**DNS（2026-09-24 已完成）**：Spaceship 的权威 DNS 对所有子域名都返回 SERVFAIL，因此先关闭 DNSSEC，再把 nameservers 迁到 Vercel（`ns1/ns2.vercel-dns.com`），Google 验证 TXT 记录也同步迁了过去。复查结果：`www` 用 308 跳转到裸域，而且保留路径（`/en/about` 也能正确跳转）。**以后修改 DNS 一律在 Vercel 团队级的 Domains 页面操作**；Vercel DNS 不支持 DNSSEC。

**验收**：写成一个部署后检查脚本或 E2E 用例，在生产 URL 上跑通，并留下输出记录。

### R3. 详情页显示"关于这个 Prompt"（§1.1 Scraping/Thin，§2.2，§3.4）

**状态（2026-09-24）**：已实现。`summary` 显示在作者那一行下面；`PromptAbout` 区块放在可编辑 Prompt 之后，和 Prompt 共用同一个滚动区，独立页和弹窗都会显示，而且都是服务端渲染。

**问题**：每条 prompt 都写好了 `summary`、`inputRequirement`、`howToUse`、`exampleNotice`、`verificationNotice`、`adaptationNotice`、`licenseNotice`，但**一个都没有显示在页面上**。Google 看到的详情页只有标题、作者·许可一行和 prompt 正文，这正是"内容单薄 / 原帖搬运"的样子。而且 `summary` 被用作 JSON-LD 的 `description`，页面上却看不到（§1.1 Structured data issue）。

**需求**：
- 标题下方显示 `summary`，作为一句导语。
- 在 prompt 编辑区下方（不打断"调整 → 复制"的主流程）增加"关于这个 Prompt"区块，按顺序展示：
  所需输入 → 使用步骤 → 示例说明（`exampleNotice` + `verificationNotice`）→ 改编说明 → 许可说明 → 原始来源列表（全部 `sources`，含 `checkedAt`）。
- 独立页默认展开。弹窗可以折叠，但内容必须在 SSR 的 HTML 里（折叠内容不算隐藏文字，见 guidelines §1.1）。
- 移动端不能让操作栏被挤到首屏之外。

**验收**：E2E 用例断言详情页 HTML 里包含上述所有字段的文本（中英各一条）；截图存档。

### R4. 结构化数据与页面对齐，并补充图片许可元数据（§1.1 Structured data，§3.4）

**状态（2026-09-24）**：已实现。`description` 等于页面上可见的摘要；`CreativeWork.mainEntityOfPage` 指向本页；每张 `ImageObject` 都带 `creator` 和 `creditText`：本站复现的图署名为站点，作者示例图署名为同一账号下来源的作者。目前**所有示例图都没有登记图片自己的许可**（`licenseNotice` 写的是"案例图片的权利另行确认"），所以**不输出** `license` / `acquireLicensePage` / `copyrightNotice`，Google 图片里也就不会出现"可授权"标记。要出现这个标记，需要先在 `examples.json` 里为每张图记录真实的许可 URL。

- R3 完成后，`CreativeWork.description` 就和页面上可见的 `summary` 一致了。在此之前不要上线这个字段，或者先改用页面上可见的文本。
- `ImageObject` 补充 Google 支持的**图片许可元数据**：`creator`（作者）、`creditText`、`copyrightNotice`、`license`（许可 URL）、`acquireLicensePage`（原始来源或 takedown/许可说明页）。这样 Google 图片里会显示"可授权"标记。值全部来自 `examples.json` 的 `rights` 与 `meta.rights`，**没有就不输出**。
- 明确告诉 Google 用哪张图做预览：图片挂在主实体上，并用 `mainEntityOfPage` 指向本页，这是 image SEO 指南推荐的两种做法之一；首图就是封面，与 `og:image` 保持一致。

**验收**：用 Rich Results Test 测一个详情页，零错误；单元测试断言缺失的 rights 字段不会被输出。

**验收结果（2026-09-24，线上 `/en/prompts/photo-abstract-editorial`）**：7 项有效，0 错误，其中 Breadcrumbs 1 项、Image Metadata 6 项。Image Metadata 的非关键提示是因为缺少可选的许可字段，属于有意为之，见上文。E2E（`seo.spec.ts`）断言不会输出 `license` 和 `acquireLicensePage`。

---

## P0 · 内容扩充（2026-09-24 决定）

### R14. 扩充收录，优先于 E-E-A-T 补强（§2.4，§1.1 Scaled/Scraping）

**决定**：当前最重要的是增加 prompt 数量：案例越多，能覆盖的搜索词越多，也越容易被分享。R5 的原创复现图等内容达到一定规模后再补。

**守住的底线**（数量增长时最容易出问题的地方，见 R9）：
- 每条仍然通过 guidelines §4 的发布前自检：有参数化或双语等增值、许可清楚、来源可核对、"尚未复现"如实写明。
- 不批量导入，每条都要经过人工审阅；译文人工审校。
- 头像类优先扩充，给 R6 的第一篇专题攒够条目（至少 3 条才能发布专题）。

**验收**：每新增一条，`pnpm content:check` 和 `pnpm test` 都通过；在 Search Console 的"网页"报告里观察"已抓取 - 尚未编入索引"的比例，比例升高就说明内容被判为单薄，要放慢收录节奏。

## P1 · 补齐 E-E-A-T

### R6. 专题合集（取代逐条编者说明；§2.2，§3.2 Expertise，§1.1 Doorway）

**决定（2026-09-24）**：不再给每条 prompt 写编者说明，改成**专题合集**，以独立页面呈现（方案 a），类似 App Store 的 Today 编辑故事。设计稿见画布 https://claude.ai/artifact/E1YUg2etHskDmnBQM2srjS 的第三行。

**为什么**：
- 专题页能覆盖"AI 头像 prompt"这类单条详情页够不着的搜索词。
- 写一篇专题，就能同时给多条 prompt 补上编者视角，投入比逐条写说明小。
- 专题页链到各详情页、详情页再链回专题页，形成 Google 能看懂的层级结构。

**需求**：
- 路由为 `/{locale}/collections/<slug>`，内容放在 `content/collections/<slug>/`，中英文各一份，引用已发布 prompt 的 slug 列表。专题页需要可被索引，并加入 sitemap，hreflang 和 canonical 规则与详情页相同。
- 页面结构：题图、H1、署名与更新日期、导语、逐条小节（图片、编者段落、"适合 / 不适合"、指向详情页的卡片），最后是"怎么选"。不做速览对比表（2026-09-24 决定，显得多余）。
- 每条详情页的"关于这个 Prompt"区块里显示"收录于专题《…》"并链接过去；对应分类页的页脚首段加一个"阅读专题"链接。
- JSON-LD：`Article`（`author` 为策展人，含 `datePublished` / `dateModified`）加上 `ItemList`（列出各条 prompt 的 URL）。

**防线**：
- 必须有分类页没有的东西：逐条点评、"适合 / 不适合"、"怎么选"的横向对比。只把卡片列一遍就是 doorway。
- 至少 3 条已发布 prompt 才能上线一篇专题。
- 不按标签批量生成，不套模板。先做 2–3 篇。

**验收**：第一篇头像专题上线；Rich Results Test 零错误；E2E 断言专题页和详情页之间的双向链接、`ItemList` 与页面上的卡片一致。

## P1 · 可见性与收录流程

### R8. 首页和分类页：H1 与介绍对人可见（§1.1 Hidden text）

**状态（2026-09-24）**：已实现，采用画布上的方案 C（https://claude.ai/artifact/Uwv8Es8JGd3w44tYQy3cST）。网格上方不加任何内容；H1 和介绍作为页脚的第一段（`data-footer-lead`），对人可见，并通过 `main` 的纵向 flex 始终贴住页脚。`CollectionPage` 的 `description` 就是这段可见介绍。放弃的方案是网格上方的一行小字（A）和编辑型大标题（B），原因是会打断以图为主的沉浸感。

**原状**：H1 和介绍放在 `sr-only` 里，代码注释写的是"留给爬虫"。按 Google 的规则，读屏文字本身合规，但"只给爬虫看"这个意图恰好落在灰区，而且这段介绍还是 `CollectionPage` JSON-LD 的 `description`。

**需求**：分类页在网格上方显示一行分类说明（小字、单行、不打断以图片为主的体验），把 H1 做成可见的小标题。首页可以保持极简，但介绍必须对人可见，例如放在页脚上方。改完后更新代码注释。

**验收**：截图对比；E2E 断言 H1 可见（没有被裁剪到 1px）。

### R9. 收录纪律写进流程（§1.1 Scaled/Scraping，§2.4）

把 guidelines §4 的发布前自检写进 `.claude/skills/add-prompt-case/SKILL.md` 和 `content/README.md`，作为发布门槛：
- 不批量导入；每条都要经过人工审阅。
- 译文必须人工审校；只有机器翻译的版本不能发布。
- `updatedAt` 只在内容有实质变化时才更新（修一个错别字不算）。
- 不为关键词造落地页；标签页和筛选页保持 `noindex`。

**验收**：skill 和文档更新后，用它新增一条 prompt，走完全部检查项。

---

## P2 · 延后

### R5. "本站复现"：显示第一手经验（§3.1 Experience）

**决定（2026-09-24）**：降为低优先级。等内容量上来后，挑精选条目和 Search Console 里展示量最高的页面来补。现阶段只保留"尚未复现"的如实说明。设计稿（复现徽标、配方弹层、本站测试记录）已放在画布第一、二行，届时直接照着实现。

**现状**：schema 已经支持 `provenance: "project-verified"` + `recipe`（模板版本、输出语言、选项、模型、生成日期），但目前 6 条 prompt 全是 `source-reported`，UI 也不展示 `recipe`；`verifiedModels` 全部为空。

**需求**：
- 示例图区分"作者示例"和"本站复现"两种来源，用小徽标标示，复现图在前。
- 复现图提供"Recipe"弹层：模型 · 日期 · 模板版本 · 所选选项，并提供"用这组选项打开"（复用分享 hash）。
- 某个模型复现成功后，才写进 `verifiedModels`，并在"关于这个 Prompt"区块里显示"本站测试"记录。

**验收**：至少 3 条已发布 prompt 有 `project-verified` 示例；E2E 断言徽标和配方渲染正确，并截图存档。

### R7. 策展人身份（§2.3 Who，§3.2，§3.4）

**决定（2026-09-24）**：等个人站上线后再做，届时 About 页只放一小段，并链接到个人站，不在本站单独做一页。专题合集（R6）的署名先只写名字。

- About 页加一两句"由 Jimmy Wong 策展"，并链接到个人站。
- JSON-LD：`WebSite.publisher` 与专题的 `Article.author` 用 `Person` 表示，`url` 填个人站，`sameAs` 填 X 和 GitHub；与 prompt 作者明确区分。
- 个人站上要链接回本站，双向指向，方便 Google 确认是同一个人。

**验收**：Rich Results Test 零错误；About 页可以看到署名和个人站链接。

## P2 · 增量流量与体验

### R10. 图片 sitemap 与文件名（§image SEO）

- 在 `sitemap.ts` 的详情条目里加上 `images`（`/media/<slug>/<file>` 的绝对 URL；Next.js 的 Sitemap 类型支持这个字段）。
- 新条目的图片文件名要有描述性，例如 `grokbot-capsule-icon-teal.jpg`，不用 `case-3.jpg`。旧文件改名要同步修改 `examples.json`，并确认 `/media` 旧 URL 返回 404 不会伤到已索引的图片。等上线且确认有图片流量后再决定改不改。

**验收**：`sitemap.xml` 里出现 `<image:loc>`；Search Console 的 sitemap 报告里能看到图片。

### R11. 作者聚合页（§3.3 Authoritativeness，谨慎做）

- `/authors/<handle>`：作者简介（仅作者公开的信息）、原主页链接、本站收录的全部 prompt。
- **只有收录数 ≥ 2 的作者页才允许被索引**，否则 `noindex`，避免 doorway 和 thin content。
- 当前 6 条 prompt 大多来自不同作者，等内容量上来再做。

### R12. Core Web Vitals 基线（§2.1 页面体验）

- 上线前用 `pnpm vitals` 记录首页和详情页的 LCP、CLS 基线，存进 `docs/seo/`。
- 上线 28 天后对照 Search Console 的"核心网页指标"报告；只要有 URL 进入"较差"，就作为 P0 处理。

### R13. Search Console 例行巡检

- **每周**：人工处置措施、安全问题（应为 0）、网页索引报告（关注"已抓取 - 尚未编入索引"，这通常是内容单薄的信号）、效果报告里的前 20 个查询。
- **每月**：按查询词复盘哪些 prompt 获得展示但点击率低，据此改标题或 `summary`。**只改描述，不改事实**。
- 在 Search Console 中开启邮件通知。

---

## 不做的事（以及理由）

| 提议 | 不做的理由 |
| --- | --- |
| `llms.txt` 或专门的 AI 标记 | Google 明确表示，出现在 AI Overviews / AI Mode 不需要这些 |
| 给每个标签或关键词建落地页 | 属于 doorway abuse 和 scaled content abuse |
| 凑字数的长文介绍 | Google 明确表示不偏好字数；编者说明有信息量就够了 |
| 输出评分或评论类结构化数据 | 页面上没有真实评分，属于结构化数据违规 |
| 和作者互换链接 | 属于 link spam |

[PROTOCOL]: Update this header when making changes, then check README.md.
