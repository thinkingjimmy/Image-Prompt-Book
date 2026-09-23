# License scope / 许可范围

The MIT License in [`LICENSE`](./LICENSE) covers the **website source code** only: `src/`, `scripts/`, `tests/` (except fixture data), configuration files and project documentation written for this repository.

It does **not** cover:

| Excluded material | Where | License |
| --- | --- | --- |
| Third-party prompts (original text) | `content/prompts/*/original.*.txt` | As recorded in each entry's `meta.json` → `rights` and `ATTRIBUTION.md` |
| Translations and parameterized adaptations of those prompts | `content/prompts/*/template.*.txt`, `parameters.json`, `en.json`, `zh-CN.json`, `docs/examples/*.md` | Same license as the original prompt, marked as adapted |
| Example images | `public/examples/` | Recorded per image in `examples.json` → `rights`; never implied by the prompt license |

For example, the first entry, `grokbot-capsule-icon`, is **CC BY-NC 4.0** by APG (@multi_serio_ai). Its Korean original, English and Chinese adaptations and all option texts keep that license, including its attribution and noncommercial conditions. Nothing in this repository is offered for unconditional commercial use unless its own record says so.

---

[`LICENSE`](./LICENSE) 中的 MIT 许可只适用于**网站源代码**：`src/`、`scripts/`、`tests/`（fixture 数据除外）、配置文件以及为本仓库编写的项目文档。

以下内容**不适用** MIT：第三方 Prompt 原文、其翻译与参数化改编（含选项文案与案例附录）、案例图片。它们分别适用各条目 `meta.json`、`ATTRIBUTION.md` 与 `examples.json` 中记录的许可。例如首个条目 `grokbot-capsule-icon` 为 APG（@multi_serio_ai）的 **CC BY-NC 4.0**，其韩文原文、中英文改编与全部选项文案保留该许可的署名与非商业条件。
