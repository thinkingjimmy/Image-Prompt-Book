# Import verification

## Independent expectations

Before token substitution, save captured source hash, normalized defaults, and essential clauses. Save the complete translated default separately before inserting tokens. Never derive expectations from the finished template.

Example /tmp/<task>/checks.json:

```json
{
  "photo-intaglio-study-poster": {
    "originalSha256": "ed7e6dd6f20f85fb61cedf64aca9c4088d4b0a75f74104265c4e0db4b6253c60",
    "variants": {
      "default": {
        "defaultPaths": {"en": "translation.en.txt", "zh-CN": "original.zh-CN.txt"},
        "requiredText": {
          "en": ["40%–55%", "Do not make it into circulating currency"],
          "zh-CN": ["40%–55%", "不要做成可流通货币"]
        }
      }
    }
  }
}
```

Paths resolve relative to JSON; text uses LF and one trailing newline. Variant keys match meta.variants IDs or default. Required clauses are checked in every combination in memory; browsers exercise each choice and combined changed settings.

## Published import

Finish content/maps/credits and prepare local published metadata:

```bash
pnpm links:check --slug <slug>
pnpm verify
pnpm test:prompt <slug> --checks /tmp/<task>/checks.json
```

Links and verify can run concurrently. One unchanged verify runs lint, typecheck, existing unit suites, content validation, production build. Do not repeat components or build fixtures for content-only previews. The runner refuses absent/stale builds and manages one loopback server.

For several entries, repeat --slug for links, run verify once, pass every slug to test:prompt, and put their expectations in the same JSON.

Artifacts: tests/test-results/prompt-import/<timestamp>/report.json, server log, bilingual per-variant desktop/mobile screenshots, gallery screenshots, traces. The inputs/ snapshot retains independent defaults and expectations; the replay command uses that snapshot rather than scratch files. English and Chinese browser checks run in separate parallel contexts. Inspect screenshots before commit. Reports distinguish independent expectations from checks not supplied.

## Draft preview

```bash
IPB_PREVIEW_DRAFTS=1 pnpm dev --port 3300
pnpm test:prompt <slug> --checks /tmp/<task>/checks.json --url http://localhost:3300
```

Use only for requested drafts or blockers; omit from the normal published path. Existing-server mode is local only and never stops that server. Draft checks omit published gallery/sitemap assertions.

## Fixes and shipping

Content/app edits require a fresh verify and affected-entry preview. Retry link errors without rebuilding. Diagnose UI failures before retrying.

Fetch main before checking git log origin/main..main. Stage explicit task paths. Another session's unpushed commits require the owner's decision. Commit/push after preview; check CI/deployment for that commit with backoff.

ChatGPT prefill is checked as a complete encoded URL only. Remote ChatGPT behavior and image generation are not exercised.

[PROTOCOL]: Update this header when making changes, then check README.md.
