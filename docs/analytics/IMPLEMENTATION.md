<!--
[INPUT]: Analytics source changes, focused E2E, pre-publication verify, and saved GA4 configuration.
[OUTPUT]: Repair status, event/reporting contracts, evidence locations and deployment acceptance.
[POS]: Analytics implementation record; follows A1, A3 and A4 from the 2026-10-03 SEO audit.
[PROTOCOL]: Update this header when making changes, then check README.md.
-->
# 数据统计修复 · 2026-10-03

代码修复及本地验证已完成，GA4 配置已保存。2026-10-03 已获授权发布至 `main`，由 Vercel 自动部署；上线状态、事件接收与活动归因以发布后验收为准。此前发现的 935 次 localhost 会话属于历史数据，本次修复不改变其数量。

## 实施结果

| 行动 | 改动 | 已验证 | 发布后验收 |
| --- | --- | --- | --- |
| A1 统计隔离 | 服务端拒绝 E2E、fixture、开发与预览环境；浏览器只允许正式 origin 初始化标签；E2E、条目预览和性能测量另行阻断 Google 请求 | fixture 不输出正式 ID；真实生产构建在 localhost/预览域名不初始化标签、不请求 Google；正式 origin 的本地代理只初始化一次 | 线上正常访问可统计，本地与浏览器验证无 collect 请求 |
| A3 活动归因 | 允许的 UTM/click 参数与列表语义参数分开解析；必要重定向保留归因；metadata 使用干净 URL | 双语首页及分类首次 200；规范化保留 UTM；未知参数清除；canonical、hreflang、robots 和 sitemap 保持原规则 | GA4 的会话来源、媒介、活动与落地链接一致 |
| A4 产品效果 | 增加 copy/open/share/option 事件；成功与失败分开；恢复分享或草稿不算主动编辑 | 正确事件及标识参数各记录一次；失败不记成功；统计报错不影响操作；路由弹窗/返回不再次初始化标签 | GA4 收到事件及维度；真实 SPA 页面浏览按路由记录，分享 hash 清理不虚增浏览 |

服务端条件见 [site.ts](../../src/lib/site.ts)，运行时 origin 检查见 [analytics.tsx](../../src/components/layout/analytics.tsx)。正式地址为 `https://imagepromptbook.com`，生产构建还需 `IPB_DEPLOY_ENV=production`、`SITE_URL=https://imagepromptbook.com`；`IPB_E2E=1`、非空 `IPB_CONTENT_DIR` 或非 production 的 `VERCEL_ENV` 均禁用统计。仅打开生产 HTML 的本地副本也不会请求 Google 标签。

归因白名单为 `utm_source`、`utm_medium`、`utm_campaign`、`utm_id`、`utm_term`、`utm_content`、`utm_source_platform`、`utm_creative_format`、`utm_marketing_tactic`、`gclid`、`dclid`、`gbraid`、`wbraid`。列表筛选和搜索的索引政策没有扩展。实现见 [attribution.ts](../../src/lib/analytics/attribution.ts) 与 [gallery-view.tsx](../../src/components/gallery/gallery-view.tsx)。

## 事件口径

| 事件 | 触发时机 | 参数 |
| --- | --- | --- |
| `copy_prompt` | 复制 Prompt 的剪贴板写入成功 | `prompt_slug`, `locale`, `variant` |
| `open_chatgpt` | 主动点击 ChatGPT 链接 | `prompt_slug`, `locale`, `variant` |
| `share_prompt` | 分享链接的剪贴板写入成功 | `prompt_slug`, `locale`, `variant` |
| `change_prompt_option` | 用户把参数改为不同选项 | `prompt_slug`, `locale`, `variant`, `parameter_id`, `option_id` |

手动复制 fallback 的展示不记为成功；打开 ChatGPT 表示点击交接，不能作为图片生成成功的证据。ChatGPT 操作附带的剪贴板写入也不另计一次 `copy_prompt`。无变化的选择、重置、版本切换和初始化不新增 option 事件。

事件边界只接受上述标识，不上传 Prompt 正文、分享 hash 或带预填 Prompt 的链接。实现见 [events.ts](../../src/lib/analytics/events.ts)、[prompt-actions.tsx](../../src/components/prompt/workbench/prompt-actions.tsx) 与 [prompt-state.tsx](../../src/components/prompt/workbench/prompt-state.tsx)。

页面浏览沿用 GA4 的初次加载和 Enhanced Measurement 浏览器历史机制，未增加手动 `page_view` 发送器。GA4 后台已确认历史页面变化选项开启；手动和自动页面浏览同时启用会造成重复，见 [Google 页面浏览说明](https://developers.google.com/analytics/devguides/collection/ga4/views)。本地测试验证标签初始化及应用事件队列，完整 GA 标签处理仍在发布后验收范围。

## 已保存的 GA4 配置

五个维度均为 Event scope：

| 维度名称 | 事件参数 |
| --- | --- |
| Prompt slug | `prompt_slug` |
| Content locale | `locale` |
| Prompt variant | `variant` |
| Prompt parameter | `parameter_id` |
| Prompt option | `option_id` |

`copy_prompt` 与 `open_chatgpt` 已登记为关键事件，采用代码发送的同名事件、Once per event，不设置默认金额。未创建以 page_view 为触发的衍生事件。关键事件页当前显示 No stream data detected，不能解释为代码已在线上送达。

已开启 URL query parameter 脱敏，键为 `prompt`；原有 email 脱敏保留。GA4 自带预览已核对：`https://chatgpt.com/?prompt=Sample%20prompt&utm_source=github` 变为 `https://chatgpt.com/?prompt=(redacted)&utm_source=github`。这样 Enhanced Measurement 的站外 `link_url` 也不会保留预填正文。该规则作用于后续收集，不修改历史记录，见 [Google 数据脱敏说明](https://support.google.com/analytics/answer/13544947)。

实际保存后的三张截图与观察记录位于 Git 忽略的 `.seo-cache/evidence/analytics/`：`ga4-dimensions.png`、`ga4-key-events.png`、`ga4-redaction.png` 和 `ga4-settings.json`。没有删除历史数据或启用永久内部流量过滤器。

## 已执行的验证

| 检查 | 结果 |
| --- | --- |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm test:analytics` | 12 项通过，桌面/手机、fixture/真实生产构建；无跳过、失败或 flaky |
| 相关既有流程的 Chromium E2E | 7 项通过：首页、分页/筛选 SEO、详情 SEO、全部参数编辑、分享、剪贴板失败、ChatGPT 交接；另补验 1 项分页规范化，UTM 保留与 canonical 干净均通过 |
| 测试所需 fixture 与真实内容生产构建 | 均构建成功 |
| 2026-10-03 发布前 `pnpm verify` | 通过：lint、类型检查、159 项既有测试、29 条内容校验与生产构建 |
| 发布前复用 E2E 证据的源码核对 | 16 个相关文件 SHA256 与上述 19 项通过记录完全一致 |
| 发布后的正式站 HTTP 验收 | 英文首页和中文头像分类带 UTM 均首次 200、归因保留、canonical 干净，新的 origin 守卫初始化代码已出现在正式 HTML |

可重复执行：

```bash
pnpm lint
pnpm typecheck
pnpm test:analytics
PLAYWRIGHT_JSON_OUTPUT_FILE="$PWD/tests/test-results/e2e/report.json" pnpm test:e2e --project=chromium --workers=2 tests/e2e/gallery.spec.ts tests/e2e/seo.spec.ts tests/e2e/editor.spec.ts --grep 'root redirects|pagination uses real|default pagination|detail pages are|all seven|share copies|when the clipboard is denied|Use in ChatGPT' --reporter=list,json --trace=on
```

统计实施阶段没有新增或执行单元测试，没有运行全套 E2E；本次发布前按项目要求运行 `pnpm verify`，包含既有单元测试。专项报告为 `tests/test-results/analytics/report.json`，12 份 trace 位于其 `artifacts/` 子目录，成功操作的四个事件载荷另存为附件。专项报告与 trace 已归档至 `.seo-cache/evidence/analytics/analytics-e2e.tar.gz`；七项回归报告为 `tests/test-results/e2e/report.json`，报告、请求附件及 trace 归档至 `regressions.tar.gz`，命令和结果记录在 `verification.json`。普通 E2E 写入独立 `tests/test-results/e2e/`，避免清除其他证据。JSON 输出选项见 [Playwright 官方说明](https://playwright.dev/docs/test-reporters#json-reporter)。

浏览器代理将正式域名请求映射到本地生产服务器，并把 Google 标签响应替换为空脚本；测试没有向线上网站或 GA4 发送模拟事件。证据证明应用的隔离和队列行为，未验证 Google 远端接收、完整标签的 SPA 处理或正式报告的归因结果。

单独补验的分页规范化保留截图、trace 和 Google 请求拦截记录；公开 HTTP 验收不执行 JavaScript、不发送统计事件。发布与压缩样本证据在本地忽略的 `.seo-cache/publication.tar.gz`，因此 HTTP 验收不等于 GA4 已处理四种产品事件。

## 发布验收与新基线

1. 发布本次应用代码，记录上线时间；执行项目发布所需检查。单靠 GA4 后台设置不会修复旧应用的 localhost 统计和 UTM 重定向。
2. 在线上核对一次首页 → Prompt 弹窗 → 返回，及一次直接分享链接加载：标签只初始化一次，真实路由页面浏览按次记录，恢复选项不生成编辑事件，hash 清理不重复计数。
3. 用有明确来源/媒介/活动的正式落地链接核对 GA4 归因；点击复制、分享、改选项和 ChatGPT 后核对四个事件及参数。使用独立验证流或明确标记验证访问，避免混入自然搜索基线。
4. 从上线时间开始，筛选 `Hostname = imagepromptbook.com`；搜索效果再加 `Session default channel group = Organic Search`。统计会话、入口页、copy/open 绝对数量，以及至少一次 copy/open 的去重会话数。Once per event 的关键事件次数不能直接充当去重会话数。

正式域名筛选不能排除维护者的真实线上访问，必要时用明确的验证标记或经过验证的内部访问规则另行分析。历史污染仍可通过可撤销的报告筛选隔离；新数据足够后再比较使用率与内容效果。
