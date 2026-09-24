# content/

> L2 | 父级: ../AGENTS.md

Git-maintained prompt library. Every file here is data: validated by `src/lib/content/load.ts` at build time (`pnpm content:check`), never executed. Code is MIT; everything in this folder keeps the license recorded per entry — see the License section of [`../README.md`](../README.md#license).

成员清单
taxonomy.json: 分类与标签词表，`categories[].labels/descriptions` 与 `tags[].labels` 均需 en/zh-CN；条目只能引用这里声明的 ID
prompts/<slug>/: 单个条目目录，目录名 = id = slug，稳定且跨语言共享；文本、选项、署名与案例图（images/）都在这一个目录里

## Entry files

| File | Purpose | Rules |
| --- | --- | --- |
| `meta.json` | Identity, status, dates, category/tags, locales, sources, rights, compatibility | `status` draft/published/archived; `publishedAt` only when published, as a timestamp with offset (`2026-09-23T21:19:45+08:00`); optional `featuredRank` (1 = first in Featured, unranked entries follow by date); HTTPS URLs |
| `original.<lang>.txt` | Untouched source prompt | UTF-8, LF, one trailing newline; changes are a source-version update |
| `en.json`, `zh-CN.json` | Page copy: title, summary, SEO, input requirement, how-to, notices, parameter labels, optional `keywords` | Complete in every locale; missing translations keep the entry in draft |
| `template.en.txt`, `template.zh-CN.txt` | Full adapted templates | Only `{{parameterId}}` tokens; every token declared, every parameter used |
| `variants` (optional, in `meta.json`) | Several editable versions, e.g. Short and Full: each with `id`, `labels`, `templateVersion`, `templatePaths`, `parametersPath` (files may sit in one subfolder such as `full/`) | The first variant must match the top-level template and is the default; page labels must cover every variant's parameters |
| `parameters.json` | `select` parameters (`renderAs` inline/block), default, options with `labels` (UI) and `replacements` (prompt text) per locale | Replacements are final plain strings — no tokens, HTML or includes |
| `examples.json` | Example images | `[]` allowed for drafts; published entries need ≥1. `images/<file>` inside the entry folder (served as `/media/<slug>/<file>` only while the entry is visible), true width/height, bilingual alt, `provenance`, `rights` (`basis` + `evidence`: where the image comes from and on what terms), `recipe` (null unless project-verified) |
| `ATTRIBUTION.md` | `## en` and `## zh-CN` blocks, each one ```text fence | Used by "Copy attribution"; keep author, source, license, changes |

## Publication gate

An entry is public only when **all** hold (`publicationBlockers()`): `status: "published"` with `publishedAt`, at least one example image, and complete en/zh-CN content, templates and attribution. The gallery, search, categories, detail pages and sitemap all use this one predicate. Drafts are visible only in local development with `IPB_PREVIEW_DRAFTS=1`: review an entry there, then switch it to `published` — there is no separate approval step.

## Renaming

Slugs are permanent. If one must change, add the old slug to `redirectFrom` in the new `meta.json`; the old URL then permanently redirects.

## Importing from a spec appendix

`pnpm content:import <slug>` copies the normative appendix `docs/appendix/<slug>.md` into this folder byte for byte; `tests/unit/prompts/<slug>.test.ts` re-checks the import.

[PROTOCOL]: Update this header when making changes, then check README.md.
