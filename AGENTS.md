# Image Prompt Book - open-source gallery of editable image generation prompts

Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Tailwind CSS 4 + shadcn/ui + next-intl 4 + Zod 4 + Vitest + Playwright

`README.md` is for people (what the project is, how to contribute, licenses). This file is for anyone changing code or content files — humans and coding agents.

<directory>
src/ - Next.js app (4 subdirs: app routes, components UI, lib content/prompt/SEO logic, i18n)
content/ - Prompt library as reviewed data files, validated at build time, never executed
messages/ - Interface text in English and Simplified Chinese
public/examples/ - Local example images, one folder per prompt
scripts/ - Content import, validation, link check, fixtures, measurements
tests/ - Vitest unit tests and Playwright end-to-end tests
docs/ - Product spec (PRD), task list, first-entry appendix, verification records
.github/ - CI, issue and pull request templates
.claude/skills/ - Agent skills; add-prompt-case imports a new prompt end to end
</directory>

<config>
package.json - Scripts and exact dependency pins; `packageManager` pins pnpm
.nvmrc - Node 22
.env.example - SITE_URL, IPB_DEPLOY_ENV, IPB_PREVIEW_DRAFTS
next.config.ts - Next.js config (honors IPB_DIST_DIR for the isolated E2E build)
playwright.config.ts - E2E projects and the fixture webServer
eslint.config.mjs / postcss.config.mjs / components.json - Lint, Tailwind, shadcn/ui
</config>

## Run

Node 22 and pnpm. No database, accounts or API keys.

```bash
corepack enable
pnpm install
pnpm dev
```

Open http://localhost:3000. Draft entries appear with `IPB_PREVIEW_DRAFTS=1 pnpm dev`.

| Command | What it does |
| --- | --- |
| `pnpm verify` | Lint, typecheck, unit tests, content check and production build — run before every PR |
| `pnpm test:e2e` | Playwright on an isolated fixture build (Chromium, mobile, Firefox, WebKit) |
| `pnpm content:check` | Validate every entry and print why it is or isn't public |
| `pnpm content:import <slug>` | Import a normative appendix from `docs/examples/` verbatim |
| `pnpm links:check` | Report unreachable source links (never changes content) |
| `pnpm vitals [baseUrl]` | Measure LCP/CLS/requests under fixed mobile conditions |

Deploy with `pnpm build && pnpm start`. Set `SITE_URL=https://imagepromptbook.com` and `IPB_DEPLOY_ENV=production` on production only; every other environment is served `noindex`.

## Adding or changing a prompt

Coding agents: use the project skill [`.claude/skills/add-prompt-case`](./.claude/skills/add-prompt-case/SKILL.md) — it covers pinning the source, license, images, templates, options and tests, with `photo-abstract-editorial` as a worked example.

1. Read [`content/README.md`](./content/README.md) for the file format.
2. Create `content/prompts/<slug>/` with `meta.json`, `original.<lang>.txt`, `en.json`, `zh-CN.json`, `template.en.txt`, `template.zh-CN.txt`, `parameters.json`, `examples.json` and `ATTRIBUTION.md`. Keep `status: "draft"`.
3. Put example images in `public/examples/<slug>/`; record true size, bilingual alt text, source and rights in `examples.json`.
4. Run `pnpm content:check` and `pnpm test`.
5. Open a PR with the template. CI checks structure only; a maintainer records reviewer, date and evidence in `meta.json` before switching to `published`.

Content rules:

- Original text is verbatim: UTF-8, LF, one trailing newline. Translations are complete, never shortened.
- Expose only options the prompt honestly supports; every `{{token}}` needs labels and replacements in both locales.
- Never invent authors, URLs, licenses, models or "verified" claims — unknown is `null`.
- No hot-linked images, no placeholder art as a result.
- Contributed Markdown/MDX/JS is never executed; prompts are plain text.

## Code conventions

- TypeScript strict. Match the surrounding code. Files ≤ 800 lines, folders ≤ 8 files (split into subfolders beyond that).
- Every user-facing string exists in both `messages/en.json` and `messages/zh-CN.json` as complete sentences; `tests/unit/i18n.test.ts` checks key and placeholder parity.
- Commit messages: conventional prefix (`feat:`, `fix:`, `style:`, `content:`, `docs:` …), short imperative English.

### Documentation protocol (code and docs must stay isomorphic)

| Layer | Where | Update when |
| --- | --- | --- |
| L1 | this `AGENTS.md` | Top-level folders or stack change |
| L2 | `<folder>/README.md` | Files added, removed, renamed, or a file's role changes |
| L3 | Header comment of each source file | Imports, exports or responsibility change |

L3 header:

```ts
/**
 * [INPUT]: what it depends on
 * [OUTPUT]: what it exports
 * [POS]: its role in the folder and relation to siblings
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
```

A change is not done until L3 → L2 → L1 are checked in that order. A source file missing its header gets one before any other work.

## Security model

- No accounts, database, uploads or model API keys; the only runtime config is the public `SITE_URL`.
- Prompt text and sources are data: rendered as escaped text, never executed. Links must be absolute HTTPS; `javascript:` and `data:` URLs are rejected by content validation.
- Share links carry only enumerated option IDs in the URL hash, which never reaches the server.
- PR CI uses `pull_request` (not `pull_request_target`) with a read-only token and no production secrets.
- Fixture content (`IPB_CONTENT_DIR`) is confined to `tests/fixtures` and refused by production deploys.
