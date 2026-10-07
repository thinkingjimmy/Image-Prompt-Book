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
pnpm verify:prompt --checks /tmp/<task>/checks.json
```

Fetch origin/main before choosing the path. Links and `verify:prompt` can run concurrently. The guarded command includes staged/unstaged/untracked changes and accepts only published prompt data plus maps/credits. It validates source hashes and full bilingual defaults before build, runs the existing content suite, builds once and checks all changed entries against that build. Do not repeat components or build fixtures. The browser runner refuses absent/stale builds and manages its own loopback server.

For a batch, repeat --slug for links and put every entry's expectations in one JSON. One fast run shares its build/server.

If the guard refuses code, shared taxonomy/collections, deletion/rename, draft or unsupported changes, use `pnpm verify` and the relevant E2E module. Published affected entries can use `test:prompt --checks` against that completed build; requested drafts use the dev preview below. A refusal is not permission to bypass the guard with another base ref.

CI uses the latest successful ancestor run as its baseline, so cancelled/failed code changes cannot be hidden by later content commits. Content mode checks combinations, builds once and installs only Chromium headless shell for affected-entry acceptance. Other changes, uncertain baselines and manual/release runs retain full validation and the cross-browser fixture suite.

Artifacts: tests/test-results/prompt-import/<timestamp>/report.json, server log, bilingual per-variant desktop/mobile screenshots, gallery screenshots, traces. The inputs/ snapshot retains independent defaults and expectations; the replay command uses that snapshot rather than scratch files. English and Chinese browser checks run in separate parallel contexts. Inspect screenshots before commit. Reports distinguish independent expectations from checks not supplied.

## Draft preview

```bash
IPB_PREVIEW_DRAFTS=1 pnpm dev --port 3300
pnpm test:prompt <slug> --checks /tmp/<task>/checks.json --url http://localhost:3300
```

Use only for requested drafts or blockers; omit from the normal published path. Existing-server mode is local only and never stops that server. Draft checks omit published gallery/sitemap assertions.

## Fixes and shipping

Content edits require a fresh guarded run; app/shared edits require a fresh full verify and affected-module preview. Retry link errors without rebuilding. Diagnose UI failures before retrying.

Fetch main before checking git log origin/main..main. Stage explicit public task paths and inspect `git diff --cached --name-only`; never stage or force-add `docs/`, which holds private maintainer data. Another session's unpushed commits require the owner's decision. Commit/push after preview; watch the one required CI job for that commit with one process and check the live page. Keep failed network push attempts in requested timing records; retry transport failures without rebuilding or changing content.

ChatGPT prefill is checked as a complete encoded URL only. Remote ChatGPT behavior and image generation are not exercised.

[PROTOCOL]: Update this header when making changes, then check README.md.
