# Worked example — photo-abstract-editorial

Request (2026-09-23): "add a new case — zh prompt: …/references/photo-abstract-editorial-prompt.zh-CN.md, en: …prompt.en.md, images and source from https://github.com/ZzzLc0405/photo-abstract-editorial".

Result: `content/prompts/photo-abstract-editorial/` (images in `images/`), `tests/unit/prompts/photo-art/photo-abstract-editorial.test.ts`.

## 1. Source

- `gh api repos/ZzzLc0405/photo-abstract-editorial/commits --jq '.[0].sha'` → `49e55073d6d0330274d31f75d27f5dd6eb35fd6d`.
- Tree listing showed `LICENSE.md`, `README.md`, `references/*.md`, `assets/examples/case-{1..4,6..11}.jpg`, and `pay/` (donation QR codes — never import).
- Upstream hashes: zh `a9652d46…d599ad051`, en `3c1160c2…07f3bf49`. The zh file had no final newline; our copy adds exactly one, and the test hashes the text minus that newline.

## 2. Author and license

- LICENSE.md: "© 2026 … All rights reserved", personal / educational / research / non-commercial use allowed, open-source projects welcome with attribution, commercial use and resale need permission, "tag me @AM.".
- README badge: CC BY-NC-SA 4.0. **Conflict** → recorded both, followed the stricter reading: `promptLicense: "LicenseRef-AM-NonCommercial"` (display "Non-commercial"), `licenseUrl` = LICENSE.md at the pinned commit, `sourceLicenseUrl` = README, `commercialUse: "restricted"`, review `pending`.
- README also says the author was copied and resold → credit prominently: `author: { name: "AM.", handle: "@ZzzLc0405", url: "https://github.com/ZzzLc0405" }`.
- Sources: repo (original) + both prompt files at `/blob/<sha>/…` (supplementary).

## 3. Images

- 10 in the repo. Kept the 6 the README features, in README order: 10, 3, 1, 11, 9, 6. The owner later asked for case-3 (balloons) as cover → moved first.
- Dropped 2, 4, 7, 8: detailed illustrations or Chinese text in the image, which this prompt forbids — likely older versions.
- `sips -Z 1600 -s format jpeg -s formatOptions 82` → 1.8 MB total. Alt text written after viewing 360 px previews.
- `rights.basis`: imported at the owner's request; author says the photos are their own; repo terms allow non-commercial use with attribution.

## 4. Templates

- Original: `original.zh-CN.txt` (the author writes in Chinese); `originalLocale: "zh-CN"`.
- Normalization: removed `# Photo Abstract Editorial Prompt (English)`, `## 1. Roles…` → `[1. Roles…]`, dropped `**`, zh: stripped 4-space indents and blank lines between list items, joined "1. 标题\n说明" into "1. 标题：说明".

## 5. Options (8), from the README's "可自由调整的部分"

| id | render | choices | contradiction handled |
| --- | --- | --- | --- |
| abstraction | block | relationships first (default) / more recognizable / more abstract | wording uses "upper/lower end of the identity cues allowed below", so the landmark bullet (1–3 cues) still holds |
| markFamily | block | best fit (default, the author's list) / 5 single families | the "choose one" list is replaced, not appended to |
| panelRatio | block | adaptive (default) / more photo / more panel | an "equal halves" option was dropped: fixed text says "do not force … equal halves"; the token was split from the following "Preserve…" sentence so it stands alone |
| panelColor | inline | ivory #F3F0E8 (default) / warm sand / mist gray / pale sage | removed "ivory" from 3 other sentences so gray never contradicts them |
| motifScale | block | standard (default) / compact / larger | — |
| accentColors | inline | up to two (default) / one / none | — |
| subtitle | inline | only if it adds meaning (default) / none / always | — |
| titleLayout | block | adaptive (default) / lower left / bottom center | — |

5,832 combinations × 2 languages are rendered in the unit test.

## 6. Copy and taxonomy

- Title: "Photo + Abstract Memory Panel" / "照片 × 抽象记忆面板".
- New category `photo-art` (Photo art / 照片艺术), new tags `editorial`, `abstract`; `meta.tags` order: editorial, abstract, minimal, image-to-image (distinctive first).
- `requiresReferenceImage: true`, `sourceRecommendedTools: ["Codex"]` (the repo is a Codex skill).

## 7. Checks run

`content:check` (2 entries valid), `links:check` (23 links reachable), `pnpm test` (74 passed), fresh E2E (71 passed), preview at desktop and 375 px.

Open items reported to the owner: confirm the license with the author; the ~5,000-character prompt may exceed what ChatGPT's `?prompt=` pre-fill accepts (the button also copies the prompt as a fallback).
