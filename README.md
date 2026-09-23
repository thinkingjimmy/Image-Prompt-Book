# Image Prompt Book - 开源生图 Prompt Gallery：看案例、改参数、复制完整 Prompt

**Explore image prompts. Make them yours.** / 发现喜欢的效果，调整成自己的版本。

Next.js 16.3.6 (App Router, Turbopack) + React 19.3.0 + TypeScript 5.9.3 (strict) + Tailwind CSS 4.3.3 + shadcn/ui (new-york, radix-ui 1.6.7) + next-intl 4.14.6 + Zod 4.6.5 + Vitest 5.0.1 + Playwright 1.63.0 · Node 22 · pnpm 11.9.0

预期生产域名：`https://imagepromptbook.com`（尚未部署）。

## 当前状态

| 已实现并有自动化测试 | 尚未完成（需维护者/所有者） |
| --- | --- |
| Gallery 瀑布流（1–5 列）、搜索、分类、标签、精选/最新、分页与 URL 同步 | 首个 Prompt 在本站实际用途下的许可确认（CC BY-NC 4.0） |
| 独立详情 + 拦截路由弹窗、图片浏览、来源与许可、原文 | 至少一张真实、已获展示权利的案例图 |
| 五参数内联编辑、完整中英文输出、复制/恢复默认/分享/来源说明、草稿 | 首个条目改为 `published`（当前为 `draft`，因此线上 Gallery 为空态） |
| en/zh-CN 界面与模板、SEO（canonical、hreflang、sitemap、JSON-LD） | 域名/DNS/HTTPS、部署、仓库公开、真实设备性能测量 |
| 内容 schema 与发布闸门、fixture 隔离、CI、贡献模板 | |

详细进度见 [TODO.md](./TODO.md)；需求基线见 [PRD.md](./PRD.md) 与 [首个案例规范](./docs/examples/grokbot-capsule-icon.md)；验证记录见 [docs/testing/](./docs/testing/)。

## 快速开始

```bash
corepack enable
pnpm install
pnpm dev
```

打开 http://localhost:3000。首个条目目前是草稿，本地预览它：

```bash
IPB_PREVIEW_DRAFTS=1 pnpm dev
```

| 命令 | 作用 |
| --- | --- |
| `pnpm dev` / `pnpm build` / `pnpm start` | 开发 / 构建（先运行内容校验）/ 启动 |
| `pnpm lint` / `pnpm typecheck` | ESLint / TypeScript |
| `pnpm test` | 生成 fixture 后运行 Vitest（192 组合、golden、内容校验等） |
| `pnpm test:e2e` | Playwright：自动在独立 fixture 构建上运行 Chromium/移动/Firefox/WebKit |
| `pnpm verify` | lint + typecheck + test + build |
| `pnpm content:check` / `pnpm content:import <slug>` / `pnpm links:check` | 内容校验 / 从附录导入 / 外链巡检（只报告） |

无需数据库、账号、模型 Key 或 GitHub Token。

## 环境变量

| 变量 | 用途 |
| --- | --- |
| `SITE_URL` | 规范域名；`IPB_DEPLOY_ENV=production` 时必须为 HTTPS。默认 `http://localhost:3000` |
| `IPB_DEPLOY_ENV` | 仅生产部署设为 `production`；其余环境（含预览部署）全部 `noindex` 且带 `X-Robots-Tag` |
| `IPB_PREVIEW_DRAFTS` | `1` 时在 `next dev` 中显示草稿；生产构建忽略 |
| `IPB_CONTENT_DIR` / `IPB_DIST_DIR` / `IPB_E2E` | 仅测试：指向 `tests/fixtures/` 内容根与独立构建目录 |

部署（Vercel 或任意 Node）：`pnpm build && pnpm start`，生产环境设置 `SITE_URL=https://imagepromptbook.com` 与 `IPB_DEPLOY_ENV=production`。不使用 `output: export`。

<directory>
src/ - 应用代码 (4 子目录: app 路由, components 界面, lib 内容/Prompt/SEO 逻辑, i18n 语言路由)
content/ - Git 维护的 Prompt 内容库与分类词表，构建期校验（见 content/README.md）
messages/ - next-intl 界面文案 en.json / zh-CN.json
public/examples/ - 审核通过的本地案例图（目前为空）
scripts/ - 内容导入、校验、外链检查、fixture 与 golden 生成
tests/ - unit（Vitest）、e2e（Playwright）、fixtures（生成、git 忽略）
docs/ - 规范性案例附录与测试记录
.github/ - CI、Issue/PR 模板
</directory>

<config>
package.json - 脚本与精确锁定的依赖；packageManager 固定 pnpm 11.9.0
pnpm-lock.yaml / pnpm-workspace.yaml - 锁文件与构建脚本白名单
next.config.ts - `/`→`/en`、安全头、非生产 noindex、图片配置、next-intl 插件
components.json - shadcn/ui preset（new-york、stone、CSS variables）
tsconfig.json / eslint.config.mjs / postcss.config.mjs - 编译、lint、Tailwind
vitest.config.mts / playwright.config.ts - 单元与端到端测试
.nvmrc / .env.example - Node 版本与环境变量样例
LICENSE / NOTICE.md - 代码 MIT 与第三方内容例外
CONTRIBUTING.md / SECURITY.md - 贡献与安全报告流程
</config>

## 许可边界

网站代码使用 [MIT](./LICENSE)。**第三方 Prompt、其翻译与参数化改编、案例图片不适用 MIT**，分别适用各条目记录的许可，详见 [NOTICE.md](./NOTICE.md)。

首个 Grokbot 案例由 APG / X `@multi_serio_ai` 创作，来源站标注 **CC BY-NC 4.0**（[案例来源](https://grokbot-icon-studio.serio-ai.chatgpt.site/en) · [来源站许可说明](https://grokbot-icon-studio.serio-ai.chatgpt.site/en/license) · [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)）。本项目的翻译与参数化改编保留该许可，不代表原作者、Grok 或任何模型提供方的认可或合作。

法则: 极简·稳定·导航·版本精确
