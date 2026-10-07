# scripts/ci/

> L2 | Parent: [../README.md](../README.md)

Members

scope.mjs: Git-based verification routing; content mode requires published prompt data and a usable ancestor baseline. CI finds the latest successful ancestor workflow run.
verify.mjs: Guarded local prompt verification; checks independent expectations, all content combinations, one build and affected-entry browser acceptance.
entries.mjs: Safe JSON-to-argv adapter for affected-entry acceptance in CI.

## Failure inventory before implementation

- Source, dependency, workflow, taxonomy, collection or unknown-file changes must require full verification.
- Missing history, no successful CI baseline, API failure, a non-ancestor base or an empty diff must require full verification.
- Failed or cancelled code runs followed by content commits must not hide the code changes; compare against successful CI, not the previous push.
- Deleted, renamed, archived, draft, malformed or symlinked entries must require full verification.
- Staged, unstaged and untracked local changes must all participate; all changed published prompts must be checked.
- Missing independent expectations or mismatched source/defaults must fail before a local build.
- Git paths and CI outputs must remain data, never shell command text.
- CI must retain one required job, a read-only token and artifacts; manual/release runs must take the full path.
- Content mode must build once and check actual bilingual desktop/mobile entries; full mode must retain existing cross-browser acceptance.

[PROTOCOL]: Update this header when making changes, then check README.md.
