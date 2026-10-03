# Image Prompt Book - open-source gallery of editable image generation prompts

Next.js 16 (App Router) + React 19 + TypeScript 5.9 + Tailwind CSS 4 + shadcn/ui + next-intl 4 + Zod 4 + Vitest + Playwright

`README.md` is for people (what the project is, how to contribute, licenses). This file is for maintainers and coding agents changing code or content. Outside contributions arrive only as issues — pull requests are not accepted.

<directory>
src/ - Next.js app (4 subdirs: app routes, components UI, lib content/prompt/SEO logic, i18n incl. UI messages)
content/ - Prompt library: one self-contained folder per prompt (text, options, credits, images/), validated at build time, never executed
scripts/ - Content import, validation, link check, performance measurement
tests/ - Vitest unit, Playwright E2E, their configs and the fixture builder (see tests/README.md)
docs/ - Acknowledgements, README screenshot (images/), first-entry appendix (appendix/), SEO guidelines and requirements (seo/), analytics implementation and acceptance (analytics/)
.github/ - CI and issue templates (source lead, translation, problem, rights request)
.claude/skills/ - Agent skills; add-prompt-case imports a new prompt end to end
</directory>

<config>
package.json - Scripts and exact dependency pins; `packageManager` pins pnpm
.nvmrc - Node 22
.env.example - SITE_URL, IPB_DEPLOY_ENV, IPB_PREVIEW_DRAFTS
next.config.ts - Next.js config (honors IPB_DIST_DIR for the isolated E2E build)
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
| `pnpm test` | Unit tests (fixtures rebuilt automatically); watch mode: `pnpm exec vitest -c tests/vitest.config.mts` |
| `pnpm typecheck` | Generate Next.js declarations, then check TypeScript — also works in a fresh checkout |
| `pnpm verify` | Lint, typecheck, unit tests, content check and production build — run before every push |
| `pnpm test:e2e` | Playwright on an isolated fixture build (Chromium, mobile, Firefox, WebKit) |
| `pnpm test:analytics` | Focused fixture/production-origin analytics E2E; intercept Google traffic and retain JSON, traces and screenshots |
| `pnpm content:check` | Validate every entry and print why it is or isn't public |
| `pnpm content:import <slug>` | Import a normative appendix from `docs/appendix/` verbatim |
| `pnpm links:check [--slug <slug>...]` | Report unreachable source links globally or for selected entries (never changes content) |
| `pnpm test:prompt <slug...> [--checks <json>]` | Reuse the verified production build for real-entry bilingual E2E and saved screenshots/traces/timings |
| `pnpm prompt:prepare <manifest> [--dry-run]` | Generate a reviewed draft entry, image dimensions, maps, credits, and independent source/default checks |
| `pnpm prompt:profile start\|mark\|run\|report --out <artifact>` | Record local phase/command timings and actual per-response tokens; separate development and import |
| `pnpm vitals [baseUrl]` | Measure LCP/CLS/requests under fixed mobile conditions |

Deploy with `pnpm build && pnpm start`. Set `SITE_URL=https://imagepromptbook.com` and `IPB_DEPLOY_ENV=production` on production only; every other environment is served `noindex`.

## Adding or changing a prompt

Coding agents: use the project skill [`.claude/skills/add-prompt-case`](./.claude/skills/add-prompt-case/SKILL.md) — it covers pinning the source, license, images, templates, options and tests, with `photo-abstract-editorial` as a worked example.

1. Read [`content/README.md`](./content/README.md) for the file format.
2. Create `content/prompts/<slug>/` with metadata, original, bilingual page copy, examples and attribution. Put templates and parameters in `templates/`, images in `images/`, and include README maps so each folder stays within eight files. Keep `status: "draft"` while authoring.
3. Put example images in `content/prompts/<slug>/images/`; record true size, bilingual alt text, source and rights in `examples.json`.
4. Credit the author in `docs/ACKNOWLEDGEMENTS.md` and record independent source/default expectations in scratch. Finish content/maps before validation; do not add per-entry unit tests or temporary browser scripts.
5. Prepare local `status: "published"` and `publishedAt`, run scoped `pnpm links:check --slug <slug>` and one `pnpm verify`, then `pnpm test:prompt <slug> --checks <json>`. Review its saved desktop/mobile screenshots before commit/push. `verify` already checks all combinations and builds; entry E2E reuses that build. Batch entries share one verify/server. Requested drafts use `IPB_PREVIEW_DRAFTS=1 pnpm dev` and the runner's `--url` option.
6. Commit explicit task files and push after preview passes. CI runs verify and browser tests. Check CI and the live page; link an originating issue in the commit when applicable.

Content rules:

- Original text is verbatim: UTF-8, LF, one trailing newline. Translations are complete, never shortened.
- Expose only options the prompt honestly supports; every `{{token}}` needs labels and replacements in both locales.
- Never invent authors, URLs, licenses, models or "verified" claims — unknown is `null`.
- No hot-linked images, no placeholder art as a result.
- Markdown/MDX/JS from sources is never executed; prompts are plain text.

## Code conventions

- TypeScript strict. Match the surrounding code. Files ≤ 800 lines, folders ≤ 8 files (split into subfolders beyond that).
- Every user-facing string exists in both `src/i18n/messages/en.json` and `zh-CN.json` as complete sentences; `tests/unit/i18n.test.ts` checks key and placeholder parity.
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
- Google Analytics (`GA_MEASUREMENT_ID`/`GA_ORIGIN` in `src/lib/site.ts`) requires a real production build, no E2E/fixture/preview flags, and the actual production browser origin. All project browser verification separately blocks Google requests. Prompt usage events contain identifiers only; pageviews remain owned by GA4 enhanced measurement.
- Prompt text and sources are data: rendered as escaped text, never executed. Links must be absolute HTTPS; `javascript:` and `data:` URLs are rejected by content validation.
- Share links carry only enumerated option IDs in the URL hash, which never reaches the server.
- CI uses a read-only token and no production secrets; it never runs on `pull_request_target`.
- Fixture content (`IPB_CONTENT_DIR`) is confined to `tests/fixtures` and refused by production deploys.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
