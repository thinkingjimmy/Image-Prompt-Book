# tests/

> L2 | 父级: ../AGENTS.md

成员清单
unit/: Vitest（node）——grokbot-prompt（96×2 组合、golden、语义回归）、content-fidelity（附录逐字导入、原文 SHA-256）、content-validation（错误内容被拒绝）、template、share-and-query、i18n（消息键与占位符一致）
unit/golden/: 默认中英文完整输出基线
e2e/: Playwright——gallery、modal-routing、editor、seo、mobile、a11y-layout（axe + 断点矩阵）；helpers.ts 提供等待水合的 test 与剪贴板/存储注入
fixtures/.generated/: 由 scripts/build-fixtures.ts 生成（git 忽略），仅 E2E/单测使用，生产内容根拒绝 fixture 记录

E2E 在独立 fixture 构建上运行（`IPB_CONTENT_DIR`、`IPB_DIST_DIR=.next-e2e`、`IPB_DEPLOY_ENV=production`、`SITE_URL=https://imagepromptbook.com`），由 playwright.config.ts 的 webServer 自动构建与启动。

[PROTOCOL]: Update this header when making changes, then check README.md.
