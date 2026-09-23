# Image Prompt Book

**发现喜欢的效果，调整成自己的版本。**

[English](./README.md) · 简体中文

一个开源的生图 Prompt Gallery。从喜欢的真实案例出发，直接在 Prompt 中调整高亮选项，然后复制或在 ChatGPT 中打开。

## 提交 Prompt

不需要会写代码，大多数贡献从一个 GitHub Issue 开始。

### 1. 推荐一个 Prompt（推荐方式）

1. 打开 **[“提交来源线索” Issue](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=source-lead.yml)**。
2. 粘贴 Prompt 的具体链接——帖子、网页或文件地址。
3. 说明它生成什么效果、需要什么输入（例如：“把角色照片变成极简机器人头像，需要一张参考图”）。
4. 已知时填写作者的公开主页；不知道就留空，请不要猜测。
5. 如果来源写明了许可或使用条款，请一并注明。

维护者会核对许可，整理中英文版本，挑选值得开放调整的选项，并在记录权利后添加案例图。你会在对应的 Pull Request 中被致谢。

### 2. 提交完整模板（Pull Request）

熟悉 Git？请阅读 [CONTRIBUTING.md](./CONTRIBUTING.md) 与[内容格式说明](./content/README.md)：每个 Prompt 一个目录 `content/prompts/<slug>/`，包含原文、完整中英文模板、可调选项和经过审核的案例图。CI 会校验结构，维护者审核权利与质量后发布。

### 其他参与方式

- **改进翻译**：提交[翻译问题](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=translation.yml)。
- **你的作品出现在这里但不应如此**：提交[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)，无需公开任何身份证明。
- **安全问题**：请私下报告，见 [SECURITY.md](./SECURITY.md)。

### 收录原则

- 许可允许分享、作者与来源清楚的 Prompt。
- 你有权分享的真实案例图，不接受冒充结果的占位图。
- 不虚构作者、链接、模型或“已验证”说法；未知的信息保持未知。

## 本地运行

需要 Node 22 与 pnpm（版本由 `packageManager` 锁定）。无需数据库、账号或 API Key。

```bash
corepack enable
pnpm install
pnpm dev
```

打开 http://localhost:3000。草稿条目需用 `IPB_PREVIEW_DRAFTS=1 pnpm dev` 预览。

| 命令 | 作用 |
| --- | --- |
| `pnpm verify` | lint、类型检查、单元测试、内容校验与生产构建 |
| `pnpm test:e2e` | 在隔离的 fixture 构建上运行 Playwright（Chromium、移动端、Firefox、WebKit） |
| `pnpm content:check` | 校验全部条目并说明是否公开及原因 |
| `pnpm links:check` | 报告不可访问的来源链接（只报告，不修改内容） |

部署：`pnpm build && pnpm start`，仅在生产环境设置 `SITE_URL=https://imagepromptbook.com` 与 `IPB_DEPLOY_ENV=production`；其他环境一律 `noindex`。

## 目录结构

<directory>
src/ - Next.js 应用（4 个目录：app 路由、components 界面、lib 内容/Prompt/SEO 逻辑、i18n）
content/ - 以审核后文件维护的 Prompt 库，构建时校验
messages/ - 中英文界面文案
public/examples/ - 本地案例图，每个 Prompt 一个目录
scripts/ - 内容导入、校验、外链检查、测试数据与性能测量
tests/ - Vitest 单元测试与 Playwright 端到端测试
docs/ - 产品需求、任务清单、首个案例附录、验证记录
.github/ - CI、Issue 与 PR 模板
</directory>

## 许可

网站代码使用 [MIT](./LICENSE)。**Prompt、其翻译与改编、案例图片各自保留原有许可**，详见 [NOTICE.md](./NOTICE.md)。首个条目 Grokbot Icon 由 APG（[@multi_serio_ai](https://x.com/multi_serio_ai)）创作，采用 CC BY-NC 4.0；本站的改编不代表原作者认可。
