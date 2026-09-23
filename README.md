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

Comfortable with Git? Add one folder per prompt under `content/prompts/<slug>/` with the original text, complete English and Chinese templates, the adjustable options and reviewed example images. The [content format](./content/README.md) lists every file; [AGENTS.md](./AGENTS.md) covers setup and checks. Keep the entry as a draft — CI validates the structure, and a maintainer reviews rights and quality before publishing.

### Other ways to help

- **Better wording** — open a [translation issue](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=translation.yml), or edit the template in a pull request.
- **Your work is here and shouldn't be** — open a [rights request](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml). You never need to post identity documents publicly.

### What we accept

- Prompts whose license allows sharing, with a clear author and source.
- The original imported word for word; translations are complete sentences, never shortened summaries.
- Real example images that you have the right to share — no placeholders presented as results, no hot-linked images.
- No invented authors, links, licenses, models or “verified” claims. Unknown stays unknown.

## Security

Report vulnerabilities **privately** through [GitHub Security Advisories](https://github.com/thinkingjimmy/Image-Prompt-Book/security/advisories/new) — please don't open a public issue. Include the affected URL or file, steps to reproduce and the impact. We aim to reply within 7 days.

Concerns about rights or privacy of content aren't security issues; use the [rights request](https://github.com/thinkingjimmy/Image-Prompt-Book/issues/new?template=rights-request.yml) instead.

## License

The [MIT License](./LICENSE) covers the **website source code only** — the app, scripts, tests (except fixture data), configuration and the project's own documentation.

It does **not** cover the content the site shows:

| Material | Where | License |
| --- | --- | --- |
| Third-party prompts (original text) | `content/prompts/*/original.*.txt` | The author's license, recorded in each entry's `meta.json` and `ATTRIBUTION.md` |
| Translations and adjustable versions of those prompts | `content/prompts/*/` templates, options and page copy, `docs/examples/` | Same license as the original, marked as adapted |
| Example images | `public/examples/` | Recorded per image in `examples.json`; never implied by the prompt's license |

Current entries:

- **Grokbot Icon** by APG ([@multi_serio_ai](https://x.com/multi_serio_ai)) — CC BY-NC 4.0. The Korean original, the English and Chinese adaptations and every option text keep its attribution and non-commercial terms. Our adaptations are not endorsed by the author.
- **Photo Abstract Editorial** by AM. (GitHub [@ZzzLc0405](https://github.com/ZzzLc0405)) — non-commercial use; commercial use needs the author's permission.

Nothing here is offered for unconditional commercial use unless its own record says so. By contributing code you license it under MIT; by contributing content you confirm you have the right to share it under the license you record.
