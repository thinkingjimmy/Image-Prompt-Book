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

熟悉 Git？在 `content/prompts/<slug>/` 下为每个 Prompt 建一个目录，包含原文、完整中英文模板、可调选项和经过审核的案例图。全部文件见[内容格式说明](./content/README.md)，环境与校验命令见 [AGENTS.md](./AGENTS.md)。条目保持草稿状态提交——CI 校验结构，维护者审核权利与质量后发布。

### 其他参与方式

- **改进翻译**：提交[翻译问题](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=translation.yml)，或直接在 Pull Request 中修改模板。
- **你的作品出现在这里但不应如此**：提交[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)，无需公开任何身份证明。

### 收录原则

- 许可允许分享、作者与来源清楚的 Prompt。
- 原文逐字导入；翻译是完整句子，不做缩写摘要。
- 你有权分享的真实案例图，不接受冒充结果的占位图，也不外链图片。
- 不虚构作者、链接、许可、模型或“已验证”说法；未知的信息保持未知。

## 安全问题

请通过 [GitHub Security Advisories](https://github.com/thinkingjimmy/Image-Prompt-Book/security/advisories/new) **私下**报告漏洞，不要公开提交 Issue。请附上受影响的网址或文件、复现步骤与影响，我们会在 7 天内回复。

内容的权利或隐私问题不属于安全问题，请使用[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)。

## 许可

[MIT 许可](./LICENSE)**只适用于网站源代码**——应用、脚本、测试（fixture 数据除外）、配置与本仓库自有文档。

网站展示的内容**不适用** MIT：

| 内容 | 位置 | 许可 |
| --- | --- | --- |
| 第三方 Prompt 原文 | `content/prompts/*/original.*.txt` | 作者的许可，记录在各条目 `meta.json` 与 `ATTRIBUTION.md` |
| 这些 Prompt 的翻译与可调版本 | `content/prompts/*/` 下的模板、选项与页面文案，`docs/examples/` | 与原文相同的许可，并标注为改编 |
| 案例图片 | `public/examples/` | 逐张记录在 `examples.json`，不因 Prompt 的许可而默认授权 |

当前条目：

- **Grokbot Icon**，APG（[@multi_serio_ai](https://x.com/multi_serio_ai)）创作，CC BY-NC 4.0。韩文原文、中英文改编与全部选项文案均保留其署名与非商业条件；本站的改编不代表原作者认可。
- **Photo Abstract Editorial**，AM.（GitHub [@ZzzLc0405](https://github.com/ZzzLc0405)）创作，仅限非商业使用，商用需获得作者许可。

除非条目自身记录另有说明，本仓库内容均不提供无条件商用授权。贡献代码即同意以 MIT 授权；贡献内容即确认你有权按所记录的许可分享。
