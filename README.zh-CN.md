# Image Prompt Book

**发现喜欢的效果，调整成自己的版本。**

[English](./README.md) · 简体中文

一个开源的生图 Prompt Gallery。从喜欢的真实案例出发，直接在 Prompt 中调整高亮选项，然后复制或在 ChatGPT 中打开。

这是一个个人策展的合集。收录完全按照我个人的品味，只上线我认为真正好的 Prompt——所以推荐的内容不一定会被收录，这并不代表对你作品的评价。

## 提交 Prompt

所有贡献都通过 GitHub Issue 提交，不需要写代码，也不需要会用 Git。本项目不接受 Pull Request：所有修改由维护者完成，权利与质量在同一处审核。

### 推荐一个 Prompt

1. 打开 **[“提交来源线索” Issue](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=source-lead.yml)**。
2. 粘贴 Prompt 的具体链接——帖子、网页或文件地址。
3. 说明它生成什么效果、需要什么输入（例如：“把角色照片变成极简机器人头像，需要一张参考图”）。
4. 已知时填写作者的公开主页；不知道就留空，请不要猜测。
5. 如果来源写明了许可或使用条款，请一并注明。

维护者会核对许可，整理中英文版本，挑选值得开放调整的选项，并在记录权利后添加案例图。我们会在你的 Issue 中回复，并在上线时附上链接。

### 其他参与方式

- **改进翻译**：提交[翻译问题](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=translation.yml)。
- **网站有错误或缺少功能**：[反馈问题](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=problem.yml)。
- **你的作品出现在这里但不应如此**：提交[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)，无需公开任何身份证明。

### 收录原则

- 许可允许分享、作者与来源清楚的 Prompt。
- 原文逐字导入；翻译是完整句子，不做缩写摘要。
- 你有权分享的真实案例图，不接受冒充结果的占位图，也不外链图片。
- 不虚构作者、链接、许可、模型或“已验证”说法；未知的信息保持未知。

## 致谢

每个 Prompt 都署名了我们认为的原创者，各案例作者见 [docs/ACKNOWLEDGEMENTS.md](./docs/ACKNOWLEDGEMENTS.md)。

## 来源与下架

Prompt 的版权很难追溯到最初的作者。本站收录的内容大多来自 GitHub 和 X（Twitter），每个详情页都会注明并链接来源。以下请求都通过 GitHub Issue 提交。

1. **署名有误**——如果我们署名的是转发者而不是原创者，请提交[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)并附上证据，例如更早的原帖链接。
2. **默认规则**——除非来源另有说明，我们默认公开分享的 Prompt 可以在署名的前提下转载分享。如果你不希望被收录，请提交[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)，我们会移除；如果你希望自己的 Prompt 被收录，欢迎[推荐给我们](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=source-lead.yml)。
3. **图片与真人**——AI 生图的结果不完全可控，可能与真实人物或已有作品相似。如果你是相关内容的权利人（包括你本人的肖像），请提交[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)，我们会将其下架。

## 安全问题

请通过 [GitHub Security Advisories](https://github.com/thinkingjimmy/Image-Prompt-Book/security/advisories/new) **私下**报告漏洞，不要公开提交 Issue。请附上受影响的网址或文件、复现步骤与影响，我们会在 7 天内回复。

内容的权利或隐私问题不属于安全问题，请使用[权利反馈](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml)。

## 许可

[MIT 许可](./LICENSE)**只适用于网站源代码**——应用、脚本、测试（fixture 数据除外）、配置与本仓库自有文档。

网站展示的内容**不适用** MIT：

| 内容 | 位置 | 许可 |
| --- | --- | --- |
| 第三方 Prompt 原文 | `content/prompts/*/original.*.txt` | 作者的许可，记录在各条目 `meta.json` 与 `ATTRIBUTION.md` |
| 这些 Prompt 的翻译与可调版本 | `content/prompts/*/` 下的模板、选项与页面文案，`docs/appendix/` | 与原文相同的许可，并标注为改编 |
| 案例图片 | `content/prompts/*/images/` | 逐张记录在 `examples.json`，不因 Prompt 的许可而默认授权 |

除非条目自身记录另有说明，本仓库内容均不提供无条件商用授权。推荐内容即确认你有权分享，或其许可允许分享。
