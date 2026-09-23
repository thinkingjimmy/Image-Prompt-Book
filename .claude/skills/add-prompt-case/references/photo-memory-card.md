# Worked example — photo-memory-card (X post, no license)

Request (2026-09-23): "use the new skill to test this: https://x.com/Sairah_0/status/2093212900160868430". The owner later pasted the post's three images into the chat.

Result: `content/prompts/photo-memory-card/`, `public/examples/photo-memory-card/`, `tests/unit/prompts/photo-memory-card.test.ts`.

## 1. Source

- Read in the browser pane with `get_page_text`; post from 2026-08-28, not edited. Model line "GPT Image 2 On ChatGPT" → `sourceRecommendedTools: ["GPT Image 2 on ChatGPT"]`.
- `original.en.txt`: the four prompt paragraphs exactly as posted (curly `’` kept, "Prompt:" label and model line dropped). SHA-256 of the text without our final newline: `68fb3195…716150f6`, asserted in the entry test.
- Author: `{ name: "Sairah", handle: "@Sairah_0", url: "https://x.com/Sairah_0" }`; source `type: "x"`, title "Sairah on X (2026-08-28)".

## 2. License

- Post and bio state no terms (bio: "AI & Tech | … DM for Collaborations"). Recorded `LicenseRef-Unspecified` ("No license stated"), `licenseUrl` = the post, `sourceLicenseUrl: null`, `commercialUse: "unknown"`, review pending; notices say all rights stay with the author.
- Not added to `ACKNOWLEDGEMENTS.md` — waits for the author's permission.
- Flagged to the owner: the concept (photo on top, hand-made rendition below, handwritten English phrase) is close to `photo-abstract-editorial`, whose author has complained about copies.

## 3. Images

- Not downloaded at first (the request was to test the skill, not to take the images). The owner then pasted all three → 1170 px originals re-encoded to JPEG **without** `-Z` (the first attempt with `-Z 1600` enlarged them). Order as posted; the kneading image is the cover. Rights pending, basis "supplied by the owner; no license stated".

## 4. Templates and options

- English template = the original with five tokens; Chinese translated sentence by sentence.
- Options: paper (4), color patch (3, incl. none), sketch medium (4), handwritten text (3), mood (3) — 432 combinations.
- Dropped a split-ratio option: the text says "top half / bottom half", so anything but 50/50 would contradict it.
- The "no text" choice first read "…but add and subtle Risograph grain" → made `{{phrase}}` replace the whole sentence ("Add subtle Risograph grain, but no text."). The entry test pins this and that defaults reproduce the post byte for byte.
