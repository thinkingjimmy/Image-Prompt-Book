---
name: add-prompt-case
description: Import and publish a prompt in Image Prompt Book from a source link or supplied text, with pinned originals, bilingual editable templates, credited local examples, and entry E2E checks. Use for 新增案例, 添加 prompt, 收录这个 prompt, or importing prompt examples.
---

# Add a prompt case

Deliver a published entry, source credit and a checked live URL. Apply the owner's existing authorization; ask only when an actual blocker remains. Read `content/README.md` once. Keep editorial decisions in one manifest; use the shared tools for file generation, measurement and verification.

## Reusable tools

Read [import-tools.md](references/import-tools.md) for the manifest shape and commands. Save one source snapshot and one reviewed manifest; `pnpm prompt:prepare <manifest>` writes files/maps/credits and independent expectations. Read paths from metadata rather than guessing a historical entry's layout. Read source-specific references only when needed; do not reload entire examples, acknowledgements, or schemas for each phase.

When timing/token records are requested, use `prompt:profile`; never rebuild a per-entry collector. Separate `development` from `import` when reusable tools need changes. Record phase boundaries, wrap commands, and start one bounded terminal-accounting reader at completion. Keep raw logs and usage reports local under ignored `tests/test-results`.

## Default path

1. **Capture once.** Check for an existing import. Read [sources.md](references/sources.md) for the matching source type. For X, locate the author's prompt-bearing reply and open its observed status URL directly. Read the whole visible prompt container; automatic links can split it into several text nodes. Save the complete UTF-8 body immediately, then reuse it with captured metadata/image URLs. A long-note ID is not the body. If access is blocked, ask early while preparing independent work. Hash source text without the added final newline; do not restore source captures from chat logs.
2. **Record rights.** Credit the source author and link; unknown stays unknown. Unstated terms use `LicenseRef-Unspecified`, `sourceLicenseUrl: null`, `commercialUse: "unknown"`, and the author's retained-rights notice, covered by the owner's standing policy. For custom terms, conflicts, or image transformations, read [rights-and-images.md](references/rights-and-images.md).
3. **Prepare examples.** Download permitted source assets concurrently, view every small preview, and record real dimensions and bilingual alt text. Retain a full collage/photo-art comparison when the prompt itself asks for that composition. Separate a genuine input/result pair only when it shows two separate stages. Re-encode without enlarging; cover first. Source examples use `provenance: "source-reported"`, `recipe: null`.
4. **Write the manifest.** Save verbatim original and independent full en/zh-CN defaults before adding tokens. Supply complete bilingual page copy, source-supported choices, image/rights records, and attribution. Run `prompt:prepare --dry-run`, then generate the entry and maps. Never summarize translations or invent source evidence.
5. **Review choices.** Expose only choices supported by the source, with 2–6 options each. Defaults reproduce source wording. Check the entire text for contradictory fixed clauses. Preserve required input, identity/composition constraints, exclusions, and complete instructions in both languages.
6. **Prepare local publication.** Finish data/maps/credits, then set local `status: "published"` and offset `publishedAt`. Production preview must pass before commit/push; editing these fields does not ship the entry. Use a draft dev preview only for requested drafts or unresolved publication blockers.
7. **Verify once, ship.** Use the guarded content command below after fetching main. A refusal means code/shared changes need the full path in [verification.md](references/verification.md). Fix failures and rerun only invalidated checks. Stage explicit public task files, inspect `git diff --cached --name-only`, then push authorized main. Check the one CI job and live page, then finish. Private `docs/` data stays outside the public commit; report formatting does not trigger more validation.

```text
content/prompts/<slug>/
  meta.json, original.<lang>.txt, en.json, zh-CN.json
  examples.json, ATTRIBUTION.md, README.md
  templates/  template.en.txt, template.zh-CN.txt, parameters.json, README.md
  images/     local examples and README.md
```

Folders stay within eight files. `meta.templatePaths` and `meta.parametersPath` point into `templates/`. Keep public author credits in `content/ACKNOWLEDGEMENTS.md`; `docs/` is ignored local material. Add bilingual category/tag labels to `content/taxonomy.json` only when existing terms do not fit.

## Template decisions

- Inline tokens replace phrases; block tokens replace a paragraph and stand alone between blank lines. Labels are short menu names; replacements are complete wording in each language.
- Assert each anchor occurs exactly once before substitution. Keep inter-token whitespace in templates; replacements are trimmed on load.
- Preserve originals separately from normalization: template Markdown headings become `[Heading]`, emphasis is removed, literal `{{fill-in}}` becomes `[fill-in]` unless it is a supported option. Record normalization/corrected typos in the adaptation notice.
- Set `requiresReferenceImage` from actual input requirements. Source model claims go in `sourceRecommendedTools`; `verifiedModels` requires project-generated evidence.
- Multiple source versions use `meta.variants`. An owner-requested rewrite retains original/adaptation credit and needs matching usable examples before publication.

## One validation pass

Write independent expectations from the captured source before template generation. Keep them in scratch; [verification.md](references/verification.md) gives the JSON format.

```bash
pnpm links:check --slug <slug>
pnpm verify:prompt --checks /tmp/<task>/checks.json
```

Links and `verify:prompt` can run concurrently. The fast command guards the entire tracked/untracked diff, checks source/default expectations before build, runs all content combinations, builds once and checks every affected bilingual entry. It saves desktop/mobile screenshots, traces and timings for options, copy/share/reset, media, attribution, gallery/sitemap and overflow. Inspect screenshots before commit.

- For a batch, finish all entries and include all their expectations in one JSON. One fast run shares the build/server; repeat `--slug` for links.
- Do not add per-entry unit tests or temporary browser scripts. The generic suite renders every combination; independent source/default/required-text expectations cover entry-specific invariants.
- Do not run full fixture E2E locally for a content-only import. UI/loader/rendering changes also need the relevant existing E2E module.
- Do not repeat validation components, E2E or build after an unchanged successful fast run. Use `content:check` early only to diagnose errors.
- New content edits invalidate its fast run; code/shared edits require the full path. Screenshot/trace review does not invalidate a build.
- Stay draft only for missing images, an owner-requested draft, or a genuine publication blocker. Do not generate placeholder sample art.

## Real blockers

Ask one bundled question if terms forbid redistribution, no usable source/supplied example exists, a known public figure needs the owner's likeness decision, or another session's unpushed commits would ship with yours. Do not infer identity from appearance. Existing third-party character/logo examples are covered by the owner's standing choice; describe them honestly in image rights.

## Completion

Report live entry, source/author, image count/material cropping, useful options, license as found, pushed commit, and actual checks. Link artifacts when useful. Mention unresolved authorship, close-copy evidence, or limitations only when observed. Checking the ChatGPT prefill URL does not test remote ChatGPT behavior or image generation.

[PROTOCOL]: Update this header when making changes, then check README.md.
