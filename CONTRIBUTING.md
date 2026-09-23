# Contributing / 参与贡献

Thanks for helping Image Prompt Book. There are three ways to contribute — only the last one needs Git.

1. **Suggest a source** — open a [source lead](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=source-lead.yml). A link, what it does and how to reach the author is enough.
2. **Improve wording** — open a [translation issue](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=translation.yml) or edit the template file in a pull request.
3. **Add a complete prompt** — follow the steps below.

## Add a prompt

1. Read [`content/README.md`](./content/README.md) for the file format.
2. Create `content/prompts/<slug>/` with `meta.json`, `original.<lang>.txt`, `en.json`, `zh-CN.json`, `template.en.txt`, `template.zh-CN.txt`, `parameters.json`, `examples.json` and `ATTRIBUTION.md`. Keep `status: "draft"` until review.
3. Put reviewed example images in `public/examples/<slug>/` and record their true size, bilingual alt text, source and rights in `examples.json`.
4. Run `pnpm content:check` and `pnpm test`.
5. Open a pull request using the template. CI checks structure only; a maintainer reviews the license, the images and the text, and records reviewer, date and evidence in `meta.json` before switching the entry to `published`.

Rules that keep the gallery trustworthy:

- Import the original verbatim; translations are complete sentences, never shortened summaries.
- Only expose options that the prompt can honestly support; every `{{token}}` needs labels and replacements in both languages.
- Never invent authors, post URLs, licenses, models or "verified" claims. Unknown stays unknown (`null`).
- Do not hot-link images or submit placeholder art as a "result".
- Contributed Markdown/MDX/JS is never executed; prompts are plain text.

## Develop

```bash
corepack enable
pnpm install
pnpm dev            # http://localhost:3000 — add IPB_PREVIEW_DRAFTS=1 to see drafts
pnpm verify         # lint, typecheck, unit tests, content check, build
pnpm test:e2e       # Playwright against an isolated fixture build
```

Code style: TypeScript strict, match the surrounding code, keep files under 800 lines and folders under 8 files. Every source file starts with an `[INPUT]/[OUTPUT]/[POS]/[PROTOCOL]` header; update it and the folder `README.md` when responsibilities change.

Code is MIT; content keeps its own license — see [`NOTICE.md`](./NOTICE.md). By contributing code you agree to license it under MIT. By contributing content you confirm you have the right to share it under the license you record.

---

## 中文摘要

- 推荐来源、改进翻译均可直接提交 Issue，无需写代码。
- 新增条目：按 [`content/README.md`](./content/README.md) 建目录与文件，保持 `draft`，运行 `pnpm content:check` 与 `pnpm test` 后提交 PR。
- CI 只校验结构；许可、图片与文本由维护者人工审核并记录审核人、日期与依据后才能发布。
- 不得虚构作者、链接、许可、模型或“已验证”说法；未知信息保持未知。
