# Image Prompt Book

**Explore image prompts. Make them yours.**

English · [简体中文](./README.zh-CN.md)

An open-source gallery of image generation prompts. Start from a real example you like, adjust the highlighted options right inside the prompt, then copy it or open it in ChatGPT.

## Submit a prompt

You don't need to write code. Most contributions start as a GitHub issue.

### 1. Suggest a prompt (recommended)

1. Open a **[“Suggest a prompt source” issue](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=source-lead.yml)**.
2. Paste the link to the prompt — the exact post, page or file.
3. Describe what it makes and what input it needs (for example, “turns a character photo into a minimal bot icon; needs one reference image”).
4. Add the author's public profile if you know it. If you don't, leave it empty — please don't guess.
5. Mention the license or usage terms if the source states them.

A maintainer checks the license, writes the English and Chinese versions, picks the options that are worth adjusting and adds example images with their rights recorded. You'll be credited in the pull request.

### 2. Submit a complete template (pull request)

Comfortable with Git? Follow [CONTRIBUTING.md](./CONTRIBUTING.md) and the [content format](./content/README.md): one folder per prompt under `content/prompts/<slug>/` with the original text, complete English and Chinese templates, the adjustable options and reviewed example images. CI validates the structure; a maintainer reviews rights and quality before publishing.

### Other ways to help

- **Better wording** — open a [translation issue](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=translation.yml).
- **Your work is here and shouldn't be** — open a [rights request](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml). You never need to post identity documents publicly.
- **Security issue** — report it privately, see [SECURITY.md](./SECURITY.md).

### What we accept

- Prompts whose license allows sharing, with a clear author and source.
- Real example images that you have the right to share — never placeholders presented as results.
- No invented authors, links, models or “verified” claims. Unknown stays unknown.

## Run it locally

Node 22 and pnpm (pinned via `packageManager`). No database, accounts or API keys.

```bash
corepack enable
pnpm install
pnpm dev
```

Open http://localhost:3000. Entries that are still drafts appear with `IPB_PREVIEW_DRAFTS=1 pnpm dev`.

| Command | What it does |
| --- | --- |
| `pnpm verify` | Lint, typecheck, unit tests, content check and production build |
| `pnpm test:e2e` | Playwright on an isolated fixture build (Chromium, mobile, Firefox, WebKit) |
| `pnpm content:check` | Validate every entry and show why it is or isn't public |
| `pnpm links:check` | Report unreachable source links (never changes content) |

Deploy with `pnpm build && pnpm start`, setting `SITE_URL=https://imagepromptbook.com` and `IPB_DEPLOY_ENV=production` on the production environment only. Every other environment is served `noindex`.

## Project layout

<directory>
src/ - Next.js app (4 folders: app routes, components UI, lib content/prompt/SEO logic, i18n)
content/ - The prompt library as reviewed files, validated at build time
messages/ - Interface text in English and Simplified Chinese
public/examples/ - Local example images, one folder per prompt
scripts/ - Content import, validation, link check, fixtures, measurements
tests/ - Vitest unit tests and Playwright end-to-end tests
docs/ - Product spec, task list, first-entry appendix, verification records
.github/ - CI, issue and pull request templates
</directory>

Stack: Next.js 16 (App Router) · React 19 · TypeScript 5.9 · Tailwind CSS 4 · shadcn/ui · next-intl 4 · Zod 4 · Vitest · Playwright.

## License

The website code is [MIT](./LICENSE). **Prompts, their translations and adaptations, and example images keep their own licenses** — see [NOTICE.md](./NOTICE.md). The first entry, Grokbot Icon by APG ([@multi_serio_ai](https://x.com/multi_serio_ai)), is CC BY-NC 4.0; its adaptations here are not endorsed by the author.
