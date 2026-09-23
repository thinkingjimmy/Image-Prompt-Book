# Image Prompt Book

**Explore image prompts. Make them yours.**

一个开源的生图 Prompt Gallery：先浏览案例图片，再通过内联选项修改 Prompt，用自己的语言理解和复制，并保留原始出处。

预期生产域名：`imagepromptbook.com`。

## 当前状态

目前交付的是需求与开发计划，尚未实现网站、部署服务或完成案例生图验证。仓库公开与代码许可证发布属于上线准备事项，不会因为加入这些文档而自动完成。

## 开发入口

| 文档 | 内容 |
| --- | --- |
| [PRD.md](./PRD.md) | 产品范围、视觉方向、页面与路由、交互、国际化、内容结构、SEO、技术方案和验收条件 |
| [TODO.md](./TODO.md) | 按依赖关系拆分的 Markdown 开发任务；尚未实现的任务均保持未勾选 |
| [首个案例规范](./docs/examples/grokbot-capsule-icon.md) | 用户提供的完整韩文原始 Prompt、中英文完整参数化模板、全部选项文案、来源与授权信息 |

`PRD.md` 与首个案例规范共同构成需求基线。开发者无需另写首个案例的 Prompt；应按附录导入、渲染和测试。

## 首版核心体验

- Jevable 风格的图片优先瀑布流，支持搜索、分类和分页。
- 从 Gallery 点击后打开详情弹窗；直接访问或刷新同一个网址时显示独立详情页。
- 详情包含案例图、内联参数选项、完整 Prompt、原文、来源和许可说明。
- 首版默认规划英文与简体中文界面及可定制模板；首个案例额外保留韩文原文。语言范围是本稿的实施默认值，不表示其他语言已经实现。
- 仓库文件驱动内容，不依赖数据库、登录账户或模型 API Key；不在站内生成图片。

## 许可边界

网站代码计划使用 MIT；实际许可证文件及适用范围在初始化开发阶段落实。**第三方 Prompt、其翻译与改编、案例图片不自动适用代码许可证。**

首个 Grokbot 案例的来源站将 Prompt 标注为 **CC BY-NC 4.0**。本项目附录记录原作者、原始链接、许可证和改动；不得将其重新标成 MIT 或无条件可商用。来源站明确说明，网页中的案例图片等素材不因与 Prompt 一同展示就自动获得该许可。公开上线前需要确认实际使用方式和图片授权。

原作者：APG / X `@multi_serio_ai`。

- [案例来源](https://grokbot-icon-studio.serio-ai.chatgpt.site/en)
- [来源站许可说明](https://grokbot-icon-studio.serio-ai.chatgpt.site/en/license)
- [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)

以上引用和改编不代表原作者、Grok 或任何模型提供方对 Image Prompt Book 的认可或合作。
