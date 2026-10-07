# tests/

> L2 | 父级: ../AGENTS.md

`pnpm test` runs the unit suites (Vitest, fixtures rebuilt automatically). `pnpm test:e2e` runs Playwright against an isolated production build of the fixture content. `pnpm verify` runs lint, typecheck, unit tests, content check and build — the same as CI before E2E. Typechecking runs next typegen first so Next.js declarations are available in a fresh checkout without a prior dev session or build.

成员清单
vitest.config.mts: 单元测试配置（pnpm test 以 -c 指向），root 指回仓库根，globalSetup 重建 fixture
playwright.config.ts: E2E configuration with an isolated fixture server by default; IPB_E2E_BASE_URL accepts an existing HTTP loopback origin for focused runtime checks. Preserves sibling analytics/import artifacts; HTML reports live in tests/playwright-report.
playwright.analytics.config.ts: pnpm test:analytics 的统计专项入口，fixture 与真实内容生产构建同时验证，Google 请求拦截，JSON/trace/截图写入 tests/test-results/analytics
images/: Real-content static WebP HTTP/browser acceptance on desktop/mobile, reuses the verified build and saves response sizes/screenshots/traces (see images/README.md)
ci/: Console E2E for conservative Git routing and the complete prompt-only verification pipeline in an isolated public checkout (see ci/README.md).
analytics/: 统计隔离、UTM 与 copy/open/share/option 事件的独立 E2E，以及所有浏览器验证共用的请求阻断器（见 analytics/README.md）
unit/helpers.ts: 共享工具——真实 content/ 的 library、promptEntry()、combinations()、composer()
unit/content.test.ts: 内容通用套件——每个条目每个版本的全部组合 × 输出语言完整、单语言、互不相同；校验闸门拒绝各类坏内容（临时副本注入错误）
unit/lib.test.ts: 纯逻辑——模板引擎、分享 hash、搜索/筛选/排序/分页
unit/i18n.test.ts: 界面文案键与 ICU 占位符在各语言一致；说明页双语结构一致
unit/prompts/<category>/<slug>.test.ts: 条目专属语义，按条目分类分子目录（avatars / photo-art/{diptych,redraw} / posters/{type-led,illustrated}），每层不超过 8 个文件，超出再按类型拆分——原文哈希、默认值复现作者原文、选项之间无矛盾；grokbot 使用 fixtures/ 的公开 Prompt 来源基线验证导入保真与 golden，不读取私有 docs/
e2e/helpers.ts: Hydrated fixtures, desktop/mobile navigation, language/tag menus and expandable search, per-context analytics blocking, clipboard/storage injection and prompt expectations (see e2e/README.md).
e2e/gallery.spec.ts: Bilingual listing/search/tag dropdown/sort/pagination checks, prompt/collection modals with nested scroll/focus restoration, history/refresh/new tabs, locale switching, layered Escape and image comparisons.
e2e/editor.spec.ts: 选项编辑、复制、分享链接、版本切换、存储/剪贴板失败、Use in ChatGPT
e2e/seo.spec.ts: 服务端 HTML（含“关于这个 Prompt”全部字段）、画廊 H1 可见且在页脚首段、无 JS 阅读、canonical/hreflang/robots、sitemap（含专题）、专题/详情双向链接与 Article ItemList、JSON-LD 与可见内容一致（摘要、图片署名、不声称图片许可）
e2e/layout.spec.ts: Canvas surface/alignment/Line footer, expandable search and keyboard focus, custom-scrolled filters and selection limits, axe WCAG A/AA, responsive columns and mobile dialogs/overflow; saved screenshots and geometry evidence.
e2e/navigation.spec.ts: Shared icon-led browsing and X/GitHub/language/text About utilities, public bilingual acknowledgements links, locale dropdown/history, keyboard/touch, 32px controls with verified 44px hit areas, license footer and retired contribution routes; saved screenshots and JSON evidence.
fixtures/build.ts: 生成 fixtures/.generated/（git 忽略，全部 fixture:true，生产内容根拒绝）；fixture-sample-02 带 input 原图，覆盖对比视图；一篇三条成员的 fixture-collection；Vitest globalSetup 与 E2E webServer 各调用一次
fixtures/grokbot-capsule-icon/: Frozen prompt-only source baselines for existing fidelity tests; public verification works without private docs/.

## Adding a prompt

The generic suite in `unit/content.test.ts` covers every new entry automatically. Do not add per-entry unit tests. Record independent source hashes, normalized defaults and required clauses in a scratch expectation JSON. Published prompt-only changes use `pnpm verify:prompt --checks <json>` after fetching origin/main; it guards the complete local diff, checks source expectations before build, runs the content suite, builds once and checks every affected entry. Code/shared-data changes use `pnpm verify` plus the relevant E2E module. The real-entry runner in `scripts/prompts/` reuses the production build, checks every bilingual variant/option, copy/share/reset, images, attribution, gallery/sitemap and mobile layout, and saves repeatable artifacts under `tests/test-results/prompt-import/<timestamp>/`. Use `--url <local URL>` for an already running draft dev server. Full fixture E2E is reserved locally for app changes or release validation.

## E2E projects

Chromium runs everything. Mobile (Pixel 7) runs `@mobile` and `@smoke`; Firefox and WebKit run `@smoke`. The server uses `IPB_CONTENT_DIR`, `IPB_DIST_DIR=.next-e2e`, `IPB_DEPLOY_ENV=production`, `IPB_E2E=1` and `SITE_URL=https://imagepromptbook.com`, so it never touches a real build. The application excludes fixture/E2E analytics, and every test context separately blocks Google requests.

## Known limits

- No test forces a server-side failure through `(site)/error.tsx`.
- Firefox/WebKit are Playwright engines with device emulation, not physical Safari or phones; screen-reader output is checked through axe and accessible names only.
- `pnpm vitals` baseline (2026-09-23, fixture build, Pixel 7, 150 ms RTT, 4× CPU): `/en` LCP 632 ms, CLS 0.001; detail LCP 536 ms, CLS 0.051. Synthetic images — repeat with real images on production before closing IPB-084.

[PROTOCOL]: Update this header when making changes, then check README.md.
