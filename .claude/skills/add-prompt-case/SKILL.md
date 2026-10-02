---
name: add-prompt-case
description: Import and publish a prompt in Image Prompt Book from a source link or supplied text, with pinned originals, bilingual editable templates, credited local examples, and entry E2E checks. Use for 新增案例, 添加 prompt, 收录这个 prompt, or importing prompt examples.
---

# Add a prompt case

Deliver a published entry, source credit, and a checked live URL. Apply the owner's existing authorization; ask only when an actual blocker remains. Read `content/README.md` once. Translation, rights, options, and image selection require judgment; file generation, measurement, and verification use the shared tools.

## Reusable tools

Read [import-tools.md](references/import-tools.md) for the manifest shape and commands. Save one source snapshot and one reviewed manifest; `pnpm prompt:prepare <manifest>` writes files/maps/credits and independent expectations. Read paths from metadata rather than guessing a historical entry's layout. Read source-specific references only when needed; do not reload entire examples, acknowledgements, or schemas for each phase.

When timing/token records are requested, use `prompt:profile`; never rebuild a per-entry collector. Separate `development` from `import` when reusable tools need changes. Record phase boundaries, wrap commands, and start one bounded terminal-accounting reader at completion. Keep raw logs and usage reports local under ignored `tests/test-results`.

## Default path

1. **Capture once.** Check whether the requested source is already imported. Save the complete extracted prompt as a UTF-8 scratch file immediately, then save metadata and image URLs beside it and reuse them. If the caption points to comments, inspect the author's prompt reply directly. An X long-note ID is not the body: expand the author reply in the browser when public metadata omits its full text. Do not reconstruct captures from session logs. If access is blocked, ask the necessary question early while continuing independent preparation. Hash the exact source without the project's added final newline. Read [sources.md](references/sources.md) only for the relevant source type.
2. **Record rights.** Credit the source author and link; unknown stays unknown. Unstated terms use `LicenseRef-Unspecified`, `sourceLicenseUrl: null`, `commercialUse: "unknown"`, and the author's retained-rights notice, covered by the owner's standing policy. For custom terms, conflicts, or image transformations, read [rights-and-images.md](references/rights-and-images.md).
3. **Prepare examples.** Download permitted source assets concurrently, view every small preview, and record real dimensions and bilingual alt text. Retain a full collage/photo-art comparison when the prompt itself asks for that composition. Separate a genuine input/result pair only when it shows two separate stages. Re-encode without enlarging; cover first. Source examples use `provenance: "source-reported"`, `recipe: null`.
4. **Write the manifest.** Save verbatim original and independent full en/zh-CN defaults before adding tokens. Supply complete bilingual page copy, source-supported choices, image/rights records, and attribution. Run `prompt:prepare --dry-run`, then generate the entry and maps. Never summarize translations or invent source evidence.
5. **Review choices.** Expose only choices supported by the source, with 2–6 options each. Defaults reproduce source wording. Check the entire text for contradictory fixed clauses. Preserve required input, identity/composition constraints, exclusions, and complete instructions in both languages.
6. **Prepare local publication.** Finish data/maps/credits, then set local `status: "published"` and offset `publishedAt`. Production preview must pass before commit/push; editing these fields does not ship the entry. Use a draft dev preview only for requested drafts or unresolved publication blockers.
7. **Verify once, ship.** Run the commands below. Fix failures and rerun only checks invalidated by the fix. Reuse existing comparison checks; extend shared tools only for a demonstrated missing requirement. Stage explicit task files, commit, and push the authorized main branch. Check CI and the live page, then finish; report formatting does not trigger another validation pass.

```text
content/prompts/<slug>/
  meta.json, original.<lang>.txt, en.json, zh-CN.json
  examples.json, ATTRIBUTION.md, README.md
  templates/  template.en.txt, template.zh-CN.txt, parameters.json, README.md
  images/     local examples and README.md
```

Folders stay within eight files. `meta.templatePaths` and `meta.parametersPath` point into `templates/`. Add bilingual category/tag labels to `content/taxonomy.json` only when existing terms do not fit.

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
pnpm verify
pnpm test:prompt <slug> --checks /tmp/<task>/checks.json
```

Links and `verify` are independent and can run concurrently. `verify` includes content validation, existing unit suites, and one production build. `test:prompt` reuses that build, manages its own server, and saves screenshots, traces, timings, and a report. Inspect desktop/mobile screenshots before commit. It checks real bilingual content, every variant/option, copy/share/reset, media, reference notices, attribution, gallery/sitemap, and mobile overflow.

- For multiple entries, finish them all, run `verify` once, and pass all slugs to `test:prompt`; repeat `--slug` for links.
- Do not add per-entry unit tests or temporary browser scripts. The generic suite renders every combination; independent source/default/required-text expectations cover entry-specific invariants.
- Do not run full fixture E2E locally for a content-only import. UI/loader/rendering changes also need the relevant existing E2E module.
- Do not rerun `content:check`, `test`, or a second build after an unchanged successful `verify`. Use `content:check` early only to diagnose content errors.
- Content/app edits require a fresh `verify` before production preview. Screenshot/trace review does not invalidate a build.
- Stay draft only for missing images, an owner-requested draft, or a genuine publication blocker. Do not generate placeholder sample art.

## Real blockers

Ask one bundled question if terms forbid redistribution, no usable source/supplied example exists, a known public figure needs the owner's likeness decision, or another session's unpushed commits would ship with yours. Do not infer identity from appearance. Existing third-party character/logo examples are covered by the owner's standing choice; describe them honestly in image rights.

## Completion

Report live entry, source/author, image count/material cropping, useful options, license as found, pushed commit, and actual checks. Link artifacts when useful. Mention unresolved authorship, close-copy evidence, or limitations only when observed. Checking the ChatGPT prefill URL does not test remote ChatGPT behavior or image generation.

[PROTOCOL]: Update this header when making changes, then check README.md.
