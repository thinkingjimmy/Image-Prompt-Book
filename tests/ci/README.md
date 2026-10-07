# tests/ci/

> L2 | Parent: [../README.md](../README.md)

Members

acceptance.mjs: Console E2E using isolated Git repositories; tests routing failures and a complete real-prompt fast run in a public checkout without private docs.

## Failure inventory before implementation

- A content addition/edit or several changed prompts must select all affected published entries.
- Code mixed with content, staged/untracked code, unsupported files and deleted/renamed content must refuse the fast command.
- Malformed/draft/archived metadata, symlinks, unknown bases and divergent history must select full verification.
- An unverified code commit followed by a content commit must select full verification against the older successful baseline.
- Missing or incorrect source expectations must stop before build or browser startup.
- The real fast command must produce a production build, bilingual screenshots/traces and replayable records, and must work without docs/.

Results stay under ignored tests/test-results/ci; temporary repositories never modify the caller's Git history.

[PROTOCOL]: Update this header when making changes, then check README.md.
