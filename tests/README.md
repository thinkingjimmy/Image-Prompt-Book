# tests/

> L2 | 父级: ../AGENTS.md

`pnpm test` runs the unit suites (Vitest, fixtures rebuilt automatically). `pnpm test:e2e` runs Playwright against an isolated production build of the fixture content. `pnpm verify` runs lint, typecheck, unit tests, content check and build — the same as CI before E2E.

成员清单
vitest.config.mts: 单元测试配置（pnpm test 以 -c 指向），root 指回仓库根，globalSetup 重建 fixture
playwright.config.ts: E2E 配置（pnpm test:e2e 以 -c 指向），webServer 在仓库根构建 fixture 站点；报告与 trace 写入 tests/playwright-report、tests/test-results（git 忽略）
unit/helpers.ts: 共享工具——真实 content/ 的 library、promptEntry()、combinations()、composer()
unit/content.test.ts: 内容通用套件——每个条目每个版本的全部组合 × 输出语言完整、单语言、互不相同；校验闸门拒绝各类坏内容（临时副本注入错误）
unit/lib.test.ts: 纯逻辑——模板引擎、分享 hash、搜索/筛选/排序/分页
unit/i18n.test.ts: 界面文案键与 ICU 占位符在各语言一致；说明页双语结构一致
unit/prompts/<slug>.test.ts: 条目专属语义——原文哈希、默认值复现作者原文、选项之间无矛盾；grokbot 另含附录导入保真与 golden（由附录独立替换计算，不存文件）
e2e/helpers.ts: 等待水合的 test、剪贴板/存储注入、按 fixture 计算期望 Prompt
e2e/gallery.spec.ts: 列表（双语、搜索/标签/排序/分页、404、恶意内容、坏图）与详情导航（路由弹窗、后退/前进、刷新、新标签、语言切换、Esc 分层）
e2e/editor.spec.ts: 选项编辑、复制、分享链接、版本切换、存储/剪贴板失败、Use in ChatGPT
e2e/seo.spec.ts: 服务端 HTML、无 JS 阅读、canonical/hreflang/robots、sitemap、JSON-LD
e2e/layout.spec.ts: axe WCAG A/AA、断点矩阵、移动端（@mobile）无横向滚动与全屏弹窗
fixtures/build.ts: 生成 fixtures/.generated/（git 忽略，全部 fixture:true，生产内容根拒绝）；Vitest globalSetup 与 E2E webServer 各调用一次

## Adding a prompt

The generic suite in `unit/content.test.ts` covers every new entry automatically. Add `unit/prompts/<slug>.test.ts` only for what is specific to that prompt: the original's hash, defaults that reproduce the author, and each contradiction between options you fixed.

## E2E projects

Chromium runs everything. Mobile (Pixel 7) runs `@mobile` and `@smoke`; Firefox and WebKit run `@smoke`. The server uses `IPB_CONTENT_DIR`, `IPB_DIST_DIR=.next-e2e`, `IPB_DEPLOY_ENV=production` and `SITE_URL=https://imagepromptbook.com`, so it never touches a real build.

## Known limits

- No test forces a server-side failure through `(site)/error.tsx`.
- Firefox/WebKit are Playwright engines with device emulation, not physical Safari or phones; screen-reader output is checked through axe and accessible names only.
- `pnpm vitals` baseline (2026-09-23, fixture build, Pixel 7, 150 ms RTT, 4× CPU): `/en` LCP 632 ms, CLS 0.001; detail LCP 536 ms, CLS 0.051. Synthetic images — repeat with real images on production before closing IPB-084.

[PROTOCOL]: Update this header when making changes, then check README.md.
