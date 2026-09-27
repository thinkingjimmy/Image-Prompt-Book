---
name: add-prompt-case
description: Add a new prompt entry (case) to Image Prompt Book from a source such as a GitHub repo, website or X post — fetch and pin the source, record author and license honestly, import example images, turn the prompt into complete English + Simplified Chinese templates with inline options, validate, test, preview and ship. Use when the user says "add a new case / 新增案例 / 添加一个 prompt / 收录这个 prompt", shares a prompt link to include, or asks to import prompt examples.
---

# Add a prompt case

A case is one folder, `content/prompts/<slug>/`, with its images in `images/` inside it (`src: "images/<file>"` in `examples.json`). The site reads files only; `pnpm content:check` is the gate. Read `content/README.md` for the field reference and `AGENTS.md` for code and documentation conventions before writing files.

## Work without stopping

The owner shares a link and expects a finished, published entry. Do not ask about anything this skill already decides. Ask one bundled question only when:

- an image shows an identifiable real person who is a public figure (likeness risk; the owner decides whether to use it), or
- local `main` has commits from another session that are not pushed yet (they would ship with yours), or
- the source's terms forbid redistribution (section 2), or the post has no usable images and none were pasted.

Everything else — downloading the post's images, choosing options, publishing after your own preview — is covered below.

Worked examples — read the one that matches your source before starting:

- `references/photo-abstract-editorial.md`: a GitHub repo with zh + en prompts, a custom non-commercial license and example images.
- `references/photo-memory-card.md`: an X post with an English-only prompt, **no license**, and images the owner pasted in.

## 1. Pin the source before reading it

- GitHub: get the latest commit SHA (`gh api repos/<owner>/<repo>/commits --jq '.[0].sha'`) and fetch every file through `raw.githubusercontent.com/<owner>/<repo>/<sha>/…`. Link sources at `/blob/<sha>/…`, never `main` — upstream edits must not silently change what we credit.
- Websites that serve the prompt through a copy button: read it the way that button does (in the page), not by scraping around access controls.
- X posts: see "X posts" below.
- Record SHA-256 of each upstream prompt file; put the short hashes in `ATTRIBUTION.md`.

**Why:** we credit and license exactly one version; a moving target makes the attribution false.

### X posts

- Every browser tool on x.com — `get_page_text`, `read_page`, `find`, `javascript_tool` — asks the owner to approve each call, and site-level approval is disabled. Stay out of the browser:
  - Metadata, thread and images from X's own embed endpoint: `curl -s "https://cdn.syndication.twimg.com/tweet-result?id=<id>&token=a&lang=en"` gives `created_at`, `edit_control.edit_tweet_ids` / `isEdited`, `in_reply_to_status_id_str`, `mediaDetails[].media_url_https`, `user`, and for X Articles `article.title` and `article.cover_media`. Both this and `publish.x.com/oembed` cut long posts (`note_tweet`) at about 280 characters and have no Article body.
  - The prompt text comes from the owner's paste. Check that its opening matches the endpoint's `text` (whitespace aside) and hash the paste. If the paste ends mid-sentence or the endpoint's text goes further, the paste is cut: say so and use the page text as below.
  - Only when there is no paste (or it is cut) and the post is long or an X Article: one `get_page_text` call on the post that holds the prompt (the reply's own URL, so nothing is cut at "Show more"). That is one approval; take everything you need from it. Article inline images are not in the endpoint (only the cover): use the cover and pasted images, or one extra `read_page`/`javascript_tool` call if more are needed, and mention it in the report.
  - Do not use third-party mirrors or scrapers.
- Pin it by URL `https://x.com/<handle>/status/<id>` (the ID never changes) and the post date. Check `isEdited` / `edit_control` from the endpoint; if edited, use the latest version and say so in `ATTRIBUTION.md`.
- `original.en.txt` (or the post's language) is only the prompt text exactly as posted — drop the "Prompt:" label and the model line, keep paragraph breaks, curly quotes and spelling. Hash that text (without our added final newline) and put the hash in `ATTRIBUTION.md` and the entry test.
- The model line (e.g. "GPT Image 2 On ChatGPT") goes to `sourceRecommendedTools`, never `verifiedModels`.
- Author: display name, `@handle`, profile URL; source `type: "x"`, `role: "original"`, title like `"<Name> on X (<YYYY-MM-DD>)"`.
- If the wording leaves authorship open (e.g. "分享一组很喜欢的提示词" — sharing prompts I like), credit the poster "as shared in the post" and tell the user the original author is unconfirmed.
- Prompts in a code block (X Articles): take them from `get_page_text` and check them against the owner's paste when there is one; Markdown-style `* ` / `**` inside them are formatting, spelled as plain text in the templates.
- Usage terms: check the post text. The endpoint has no profile bio, so read the bio only when you already spend a page read on this source; otherwise record "no license stated in the post". A bio like "DM for collaborations" is not a license.
- The prompt is often not in the linked post. "完整提示词放评论区", "Prompt 👇" or a "Show more" cut mean it sits in the author's own reply, and the images sit in the main post above it. Open every post in the author's thread, take the prompt from the reply and the images from the main post; ignore quoted posts and other people's replies. Record the reply as `role: "original"` and the main post as a `role: "supplementary"` source (title `"<Name> on X (<date>), examples"`); each example's `sourceUrl` is the post it came from.
- When the prompt shares a post with commentary, keep only the prompt part (drop the intro, "Prompt 👇" and the model line) before hashing.
- Images in the post (`pbs.twimg.com`): the owner sharing the link is the permission to download the images in that post and in the author's thread (section 3). Pasted images count as supplied by the owner; they may exist only in the chat and not on disk — then fetch the same images from the post.
- Compare the idea with existing entries. If it closely resembles another author's prompt, tell the user — some authors have publicly complained about copies.

## 2. Settle author and license — then stop if it is not allowed

- Read LICENSE *and* README. When they disagree, record both and follow the stricter one (see the worked example: README badge CC BY-NC-SA 4.0 vs LICENSE "all rights reserved, non-commercial").
- Credit the name the author asks for (e.g. "tag me @AM."), plus the account handle and URL. Unknown author → leave it out; never guess.
- `rights.promptLicense`: an SPDX id, or `LicenseRef-<Name>` for custom terms (add a short display name to `LICENSE_NAMES` in `src/components/prompt/prompt-detail.tsx`). `commercialUse`: `restricted` unless the license clearly allows it.
- If the terms forbid redistribution even non-commercially, tell the user and do not import the text.

### No license stated

Silence is not a license: the author keeps all rights. The owner may still show the case with credit and a link to the original post, and removes it on the author's request. Record it like this:

- `promptLicense: "LicenseRef-Unspecified"` (already mapped to "No license stated"), `licenseUrl`: the post or page where you checked for terms, `sourceLicenseUrl: null`, `commercialUse: "unknown"`.
- `licenseNotice` / `ATTRIBUTION.md`: "License: none stated. All rights remain with the author; shown here with credit and a link to the original post."
- Images: `rights.basis` naming who supplied them and that no license is stated.
- Optionally offer the user this courtesy note to send the author:

  > Hi <name>, I run Image Prompt Book (https://github.com/thinkingjimmy/Image-Prompt-Book), an open-source, non-commercial gallery of editable image prompts. May I include your prompt from <post URL>, with credit and a link to your post, plus the example images from that post? I'd add an English/Chinese version with a few adjustable options, clearly marked as an adaptation.
  >
  > 你好 <name>，我在做 Image Prompt Book（开源、非商业的可编辑生图 Prompt 图库）。想收录你在 <post URL> 分享的 Prompt 和帖子里的案例图，会署名并链接原帖，并提供标注为改编的中英文版本与少量可调选项，可以吗？

**Why:** the site shows third-party work; a wrong license or credit is the one mistake that cannot be fixed with a redeploy.

## 3. Images: fetch, pick, localize

- Fetch originals with `curl "https://pbs.twimg.com/media/<id>?format=jpg&name=orig"`; look at small previews (`sips -Z 360`) before choosing. Never hotlink.
- Prefer the images the author features (README order). Drop ones that contradict the prompt (e.g. text in the image when the prompt forbids text) or come from older versions.
- Resize to ≤1600 px on the long edge, JPEG q≈82 (`sips -Z 1600 -s format jpeg -s formatOptions 82 in --out out`); keep PNG only for transparency. `sips -Z` also **enlarges** smaller images — check `sips -g pixelWidth` first and drop `-Z` when the image is already ≤1600 px. Put the chosen cover first in `examples.json`.
- Collages (grids, triptychs) are cut into single images along their gutters or seams; the post shows the format the prompt asks for (e.g. 9:16), so drop crops in another format. Before/after comparisons (photo above, result below) are split at the seam: the result becomes the example, the photo half becomes its `input` (both cropped to the same frame so they line up in the slider; see `crayon-lifestyle-poster`). Crop with ffmpeg (`ffmpeg -i in.jpg -vf "crop=W:H:X:Y" -q:v 3 out.jpg`; `sips` crops are unreliable), find the seam by rendering a thin band around it, and check crops are not duplicates (`md5`).
- Third-party characters, title logos or brands in the images: the owner's standing decision is to show them. Keep them, say so in `rights.basis` ("… show third-party characters and title logos; the owner chose to show them"), and mention it in the report. Real public figures still need the owner's answer (see "Work without stopping"); alt text describes what is drawn and never names the person.
- Look at every image (small preview) and write true bilingual `alt` text. Real `width`/`height` (the checker verifies them).
- `rights` with an honest `basis` (who asked, what the source terms say) and `evidence` (license URL). `provenance: "source-reported"`, `recipe: null`.
- Samples the owner generates with our template are `provenance: "project-verified"` with a full `recipe` (template version, output locale, selections, model, date), `sourceUrl`/`evidence` pointing at the entry's own page, plus a `meta.verifiedModels` row; see `circle-logo-avatar`.

**Why:** `basis` is the record of where each image came from if the author ever asks.

## 4. Build the templates

- `original.<lang>.txt`: the author's primary-language file, byte for byte (only line endings to LF and exactly one final newline). A unit test compares its hash to upstream.
- `template.en.txt` / `template.zh-CN.txt`: complete text, never a summary. Normalize Markdown to plain prompt text: `## Heading` → `[Heading]`, drop `**`, drop the document title line, remove Obsidian-style indentation and blank lines between list items. If the author supplied both languages, use theirs; otherwise translate every sentence.
- One version per prompt by default. If the source has a short and a full version, add `meta.variants` (see `grokbot-capsule-icon`: short is default, full lives in `full/`).
- Text the renderer would misread: `{{…}}` fill-in slots become `[…]` fields (or an option when they list choices, e.g. an aspect ratio); lines starting with `#` (hex colors) are joined onto their label line (`背景：#D97757`). Record both in `ATTRIBUTION.md`; the entry test then compares defaults to the original modulo that formatting (see `research-report-cover`). Fixing an obvious typo in the template is fine; say so in `adaptationNotice`.
- An owner-requested rewrite of someone's prompt (e.g. "avatar only" from a diptych) is its own entry: keep the author's text as `original.*.txt`, credit them as `role: "original"`, mark the change in `adaptationNotice` and `ATTRIBUTION.md`, and keep it a draft until the owner's samples arrive (see `circle-logo-avatar`).

## 5. Choose options (the part that needs judgment)

Start from what the author says is adjustable (README "you can change…"), then keep only choices a user would actually want. Each option is a `{{parameterId}}` token with 2–6 choices.

- `renderAs: "inline"` for a phrase inside a sentence (color, count, short clause); the chip shows the actual wording, so every replacement must read naturally in its sentence in both languages.
- `renderAs: "block"` for a whole paragraph or list; the token must be alone in its paragraph (blank lines before and after), or it renders as a giant inline chip.
- The default option must reproduce the author's wording exactly.
- **No contradictions.** Search the whole template for sentences an option would contradict and move them into the option, or neutralize them. Examples from real cases: "ivory panel" mentioned in three places vs a panel-color option; "do not standardize skin color" vs a face-color option; an "equal halves" ratio option vs a fixed "never equal halves" rule (dropped the option instead).
- Labels (`labels.en`, `labels.zh-CN`) are short menu names; `replacements` are the prompt text. Never mix them.

Write the generator as a throwaway Python script in the scratchpad that asserts every anchor string appears exactly once before replacing it — a silent miss leaves the author's text and your option side by side. Start it with `# -*- coding: utf-8 -*-` (the system Python 3.9 rejects long CJK lines without it), keep long upstream text in a scratch `.json`/`.txt` file rather than inline, and use quoted heredocs (`<<'EOF'`) so backticks in `ATTRIBUTION.md` are not executed by the shell.

## 6. Page copy and taxonomy

- `en.json` / `zh-CN.json`: title, summary, SEO title/description, input requirement, how-to (mention Copy and ChatGPT), notices, `parameterLabels` for every parameter of every variant, optional `keywords`.
- Categories/tags must exist in `content/taxonomy.json` (add with both labels). Order `meta.tags` by what should show first on the card; put distinctive tags before generic ones.
- `requiresReferenceImage: true` when the user must attach an image — the detail page then shows the "use with your own image" notice.
- `createdAt`/`updatedAt` as `YYYY-MM-DD`. Publish once your own preview passes: `status: "published"` and `publishedAt` as a full timestamp with offset (`date +%Y-%m-%dT%H:%M:%S+08:00`) so Latest reflects the real order. Stay `draft` (`publishedAt: null`) only when there is no usable image yet or the owner asked for a draft. Add `featuredRank` (1 = first) only if the owner wants the entry featured.

## 7. Verify, preview, ship

```bash
pnpm content:check          # must list the entry as valid (not public is expected)
pnpm links:check            # every source/license/image link reachable
pnpm test                   # add tests/unit/prompts/<category>/<slug>.test.ts, see below
pnpm verify && CI=1 pnpm exec playwright test --retries=0
```

Unit test: `tests/unit/content.test.ts` already renders every option combination of every entry in both languages (no `{{`, `undefined`, `**` or leftover `#` headings, one trailing newline, every option changes the text). Add `tests/unit/prompts/<category>/<slug>.test.ts` (copy `photo-art/photo-abstract-editorial.test.ts`) only for what is specific: original matches the upstream hash; core rules survive every combination; defaults reproduce the author; each contradiction you fixed stays fixed.

Preview with the `dev-drafts` launch config (`IPB_PREVIEW_DRAFTS=1 pnpm dev`): check the card (cover, tags on one line, author), the detail at desktop and 375 px (chips wrap, block options lead their paragraph, notice above the buttons). New images often show "image failed to load" for the first few loads while the dev server warms up; wait and reload two or three times before treating it as a bug.

Then add a row to `docs/ACKNOWLEDGEMENTS.md` (see "Acknowledgements" below — the READMEs and the About page link to it instead of listing entries), run `pnpm verify`, commit staging only your files (`git add <paths>`, never `-A` — other sessions may be editing), and push `main`. Check `git log origin/main..main` first: unpushed commits from another session need the owner's OK. Entry tests live in `tests/unit/prompts/<category>/`; keep every folder at 8 files or fewer.

### Acknowledgements

`docs/ACKNOWLEDGEMENTS.md` thanks every author whose prompt the site shows. Add one row per case, in the order cases were added, matching the existing rows:

```md
| <English title><br><Chinese title> | <Author> ([@handle](<profile URL>)) | [<source title>](<original source URL>) | [<license name>](<license URL>) |
```

- Use the same author name and handle as `meta.json` and its `role: "original"` source (repo root or post URL); the license link is the one in `rights.licenseUrl`, labelled in both languages when it is custom (e.g. `Non-commercial / 非商业`).
- A case with **no license stated** gets its row right away, with `No license stated / 未声明许可` linking the post. Permission is not required; if the author objects through a rights-request issue, take the case and its row down.
- Keep the closing paragraphs (adaptations are not endorsed; rights-request link) untouched.

## Report to the user

Say what was published (source + commit or post ID, and the pushed commit), the license as found (any conflict, or that none is stated), which images were kept, cropped or dropped and why (including third-party characters or logos you kept), the options you chose (and any you dropped to avoid contradictions), and anything left as a draft and why. Flag anything you could not verify, such as very long prompts in the ChatGPT pre-fill link, and any close resemblance to an existing entry.
