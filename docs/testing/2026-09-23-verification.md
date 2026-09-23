# Verification record — 2026-09-23

Scope: first implementation of M0–M4 and the automatable part of M5. Executed locally on macOS (Darwin 25.4), Node 22.17.0, pnpm 11.9.0. Nothing has been deployed, committed or published; no image rights or usage review has been performed.

## Commands and observed results

| Command | Result |
| --- | --- |
| `pnpm lint` | 0 problems |
| `pnpm typecheck` | 0 errors |
| `pnpm content:check` | `grokbot-capsule-icon [draft] not public (status is draft; publishedAt is missing; prompt usage review is not approved; at least one approved real example image is required)` — 1 entry valid |
| `pnpm test` (Vitest) | 6 files, 60 tests passed (v2 short template: 1,728 combinations × 2 languages) |
| `pnpm build` | Success; `/en/about` etc. prerendered, detail pages SSG, listings dynamic |
| `pnpm test:e2e` (Playwright, fixture build) | 70 passed, 2 skipped (mobile-only spec on desktop project); after the owner-requested redesign (jevable-style header, ImageFX-style minimal detail, v2 short template, Use in ChatGPT) two consecutive fresh-build runs with `CI=1 --retries=0` both passed across chromium, mobile (Pixel 7), firefox and webkit |
| `pnpm links:check` | 4 links, 0 unreachable |
| Fresh copy of the working tree → `pnpm install --frozen-lockfile && pnpm verify` without `SITE_URL` | Passed (no database, model key or token needed) |

## Acceptance criteria coverage

| AC | Evidence |
| --- | --- |
| AC-01 | `gallery.spec` root redirect, en/zh cards, single card per prompt |
| AC-02 | `gallery.spec` search/tags/sort/pagination/URL restore; `share-and-query.test` |
| AC-03/04/05 | `modal-routing.spec` modal, close, back/forward, scroll + focus restore, refresh, direct visit, modifier-click |
| AC-06/07/08 | `editor.spec` five parameters; `grokbot-prompt.test` composition/blush/flat regressions |
| AC-09/10/11 | `grokbot-prompt.test` 96 × 2 = 192 outputs, golden snapshots; `content-fidelity.test` SHA-256 `b0ab40da…acbc` |
| AC-12 | `editor.spec` output vs UI language; `modal-routing.spec` language switch keeps options; `i18n.test` |
| AC-13/14/15 | `editor.spec` share link restore, bad/old hash, storage disabled, clipboard denied |
| AC-16 | `editor.spec` binding status unknown → match → mismatch, image unchanged |
| AC-17 | `mobile.spec`, `a11y-layout.spec` (axe WCAG 2.2 A/AA, focus trap, Esc layering) |
| AC-18/19 | `seo.spec` server HTML, no-JS reading, canonical/hreflang/robots matrix, sitemap, robots.txt, JSON-LD |
| AC-20 | `content-validation.test` publish gate; source panel E2E; attribution copy |
| AC-21 | `gallery.spec` hostile title/summary escaped; `content-validation.test` rejects `javascript:`/HTTP URLs; hostile hash values ignored |
| AC-22 | Fresh-copy frozen install + `pnpm verify` |
| AC-23 | Empty/catalog-empty states, failed image placeholder, 404s |
| AC-24 | **Not done** — requires real domain, deployment, approved real example and usage review |

## Performance baseline (`pnpm vitals`, fixture build)

Conditions: Chromium, Pixel 7 emulation, 150 ms RTT, 1.6 Mbps down, 4× CPU slowdown, cold cache, `next start` on localhost, **synthetic solid-colour PNG fixtures** (not real example images).

| Page | LCP (ms) | CLS | Requests | Transferred (KB) |
| --- | --- | --- | --- | --- |
| /en | 632 | 0.001 | 34 | 296 |
| /en/prompts/grokbot-capsule-icon | 536 | 0.051 | 25 | 300 |

This is a single local sample. It must be repeated with real, compressed example images on the production host before IPB-084 can be closed. INP has no field data and is not reported.

## Known limits

- The error boundary (`(site)/error.tsx`) exists but no test forces a server-side request failure.
- Cross-browser checks use Playwright's WebKit/Firefox engines and device emulation, not physical Safari or phones.
- Screen-reader output was checked through axe and accessible-name assertions, not with a real screen reader.
- CI (`.github/workflows/ci.yml`) has not run on GitHub yet; its steps were executed locally.
