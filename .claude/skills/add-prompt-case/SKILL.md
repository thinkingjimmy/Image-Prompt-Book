---
name: add-prompt-case
description: Add a new prompt entry (case) to Image Prompt Book from a source such as a GitHub repo, website or X post — fetch and pin the source, record author and license honestly, import example images, turn the prompt into complete English + Simplified Chinese templates with inline options, validate, test, preview and ship. Use when the user says "add a new case / 新增案例 / 添加一个 prompt / 收录这个 prompt", shares a prompt link to include, or asks to import prompt examples.
---

# Add a prompt case

A case is one folder in `content/prompts/<slug>/` plus its images in `public/examples/<slug>/`. The site reads files only; `pnpm content:check` is the gate. Read `content/README.md` for the field reference and `AGENTS.md` for code and documentation conventions before writing files.

Worked example: `references/photo-abstract-editorial.md` (a GitHub repo with zh + en prompts, a custom non-commercial license and example images). Read it before your first case — it shows every decision below applied once.

## 1. Pin the source before reading it

- GitHub: get the latest commit SHA (`gh api repos/<owner>/<repo>/commits --jq '.[0].sha'`) and fetch every file through `raw.githubusercontent.com/<owner>/<repo>/<sha>/…`. Link sources at `/blob/<sha>/…`, never `main` — upstream edits must not silently change what we credit.
- Websites that serve the prompt through a copy button: read it the way that button does (in the page), not by scraping around access controls.
- Record SHA-256 of each upstream prompt file; put the short hashes in `ATTRIBUTION.md`.

**Why:** we credit and license exactly one version; a moving target makes the attribution false.

## 2. Settle author and license — then stop if it is not allowed

- Read LICENSE *and* README. When they disagree, record both and follow the stricter one (see the worked example: README badge CC BY-NC-SA 4.0 vs LICENSE "all rights reserved, non-commercial").
- Credit the name the author asks for (e.g. "tag me @AM."), plus the account handle and URL. Unknown author → leave it out; never guess.
- `rights.promptLicense`: an SPDX id, or `LicenseRef-<Name>` for custom terms (add a short display name to `LICENSE_NAMES` in `src/components/prompt/prompt-detail.tsx`). `commercialUse`: `restricted` unless the license clearly allows it.
- `rights.releaseReview.status` stays `pending`. Only the owner approves, with reviewer, date and evidence.
- If the terms forbid redistribution even non-commercially, tell the user and do not import the text.

**Why:** the site shows third-party work; a wrong license or credit is the one mistake that cannot be fixed with a redeploy.

## 3. Images: ask, pick, localize, keep pending

- Download only when the user asked for this source's images (that is the permission). Never hotlink.
- Prefer the images the author features (README order). Drop ones that contradict the prompt (e.g. text in the image when the prompt forbids text) or come from older versions.
- Resize to ≤1600 px on the long edge, JPEG q≈82 (`sips -Z 1600 -s format jpeg -s formatOptions 82 in --out out`); keep PNG only for transparency. Put the chosen cover first in `examples.json`.
- Look at every image (small preview) and write true bilingual `alt` text. Real `width`/`height` (the checker verifies them).
- `rights.status: "pending"` with an honest `basis` (who asked, what the source terms say) and `evidence` (license URL). `provenance: "source-reported"`, `recipe: null`.

**Why:** pending images show in `IPB_PREVIEW_DRAFTS=1 pnpm dev` but block publishing until someone records permission.

## 4. Build the templates

- `original.<lang>.txt`: the author's primary-language file, byte for byte (only line endings to LF and exactly one final newline). A unit test compares its hash to upstream.
- `template.en.txt` / `template.zh-CN.txt`: complete text, never a summary. Normalize Markdown to plain prompt text: `## Heading` → `[Heading]`, drop `**`, drop the document title line, remove Obsidian-style indentation and blank lines between list items. If the author supplied both languages, use theirs; otherwise translate every sentence.
- One version per prompt by default. If the source has a short and a full version, add `meta.variants` (see `grokbot-capsule-icon`: short is default, full lives in `full/`).

## 5. Choose options (the part that needs judgment)

Start from what the author says is adjustable (README "you can change…"), then keep only choices a user would actually want. Each option is a `{{parameterId}}` token with 2–6 choices.

- `renderAs: "inline"` for a phrase inside a sentence (color, count, short clause); the chip shows the actual wording, so every replacement must read naturally in its sentence in both languages.
- `renderAs: "block"` for a whole paragraph or list; the token must be alone in its paragraph (blank lines before and after), or it renders as a giant inline chip.
- The default option must reproduce the author's wording exactly.
- **No contradictions.** Search the whole template for sentences an option would contradict and move them into the option, or neutralize them. Examples from real cases: "ivory panel" mentioned in three places vs a panel-color option; "do not standardize skin color" vs a face-color option; an "equal halves" ratio option vs a fixed "never equal halves" rule (dropped the option instead).
- Labels (`labels.en`, `labels.zh-CN`) are short menu names; `replacements` are the prompt text. Never mix them.

Write the generator as a throwaway Python script in the scratchpad that asserts every anchor string appears exactly once before replacing it — a silent miss leaves the author's text and your option side by side.

## 6. Page copy and taxonomy

- `en.json` / `zh-CN.json`: title, summary, SEO title/description, input requirement, how-to (mention Copy and ChatGPT), notices, `parameterLabels` for every parameter of every variant, optional `keywords`.
- Categories/tags must exist in `content/taxonomy.json` (add with both labels). Order `meta.tags` by what should show first on the card; put distinctive tags before generic ones.
- `requiresReferenceImage: true` when the user must attach an image — the detail page then shows the "use with your own image" notice.
- `status: "draft"`, `publishedAt: null`, dates as `YYYY-MM-DD`.

## 7. Verify, preview, ship

```bash
pnpm content:check          # must list the entry as valid (not public is expected)
pnpm links:check            # every source/license/image link reachable
pnpm test                   # add tests/unit/prompts/<slug>.test.ts, see below
pnpm verify && CI=1 pnpm exec playwright test --retries=0
```

Unit test: `tests/unit/content.test.ts` already renders every option combination of every entry in both languages (no `{{`, `undefined`, `**` or leftover `#` headings, one trailing newline, every option changes the text). Add `tests/unit/prompts/<slug>.test.ts` (copy `photo-abstract-editorial.test.ts`) only for what is specific: original matches the upstream hash; core rules survive every combination; defaults reproduce the author; each contradiction you fixed stays fixed.

Preview with `IPB_PREVIEW_DRAFTS=1 pnpm dev`: check the card (cover, tags on one line, author), the detail at desktop and 375 px (chips wrap, block options lead their paragraph, notice above the buttons).

Then add the entry to "Current entries" under `## License` in both `README.md` and `README.zh-CN.md` (author, license, commercial terms), add one line to `docs/TODO.md` (source, commit, license status, what is pending), commit on a branch staging only your files (`git add <paths>`, never `-A` — other sessions may be editing), fast-forward `main`, push.

## Report to the user

Say what was imported (source + commit), the license as found (and any conflict), which images were kept or dropped and why, the options you chose, and exactly what still blocks publishing (usage review, image permission). Flag anything you could not verify, such as very long prompts in the ChatGPT pre-fill link.
