# scripts/prompts/

> L2 | Parent: [../README.md](../README.md)

Members

check.ts: `pnpm test:prompt <slug...> [--checks <json>] [--url <local URL>]`; reads real entries and independent source expectations, records timings and browser artifacts, and reuses the completed production build.
browser.ts: Parallel bilingual entry E2E checks for all variants, options, copy/share/reset, attribution, media, comparison controls, reference input, gallery/sitemap, and 375 px layout.
server.ts: Starts one production server on a free loopback port and stops only that child process; never builds or replaces an existing server.
prepare.ts: `pnpm prompt:prepare <manifest> [--dry-run]`; validates captured source/defaults and writes an entry, measured images, maps, credit, and independent E2E expectations.
profile.ts: `pnpm prompt:profile start|mark|run|report`; records phases and command wall time, reads actual per-response usage, and exports local-only timing/token reports.

## Failure inventory

Written before implementing the runner:

- Missing or malformed slugs, expectation files, source hashes, or builds must fail before browser checks.
- A stale build must not pass with old titles, templates, options, examples, or publication state.
- Truncated originals, changed defaults, dropped required clauses, broken images, and missing attribution must fail.
- Every option and variant must reach the clipboard; shared settings must restore in a fresh page, and reset must restore defaults.
- Comparison inputs, reference-image notices, gallery visibility, sitemap membership, and mobile overflow must be checked.
- Comparisons must start centered, respond to Home/End and arrow keys without exceeding bounds, track pointer drags at desktop and mobile widths, and reset when switching examples; gallery cards must retain both stages.
- Browser errors must fail the run; failures must retain a report and trace.
- A failed or interrupted run must stop its own server without touching other processes.

Import-tool failure inventory, recorded before implementation:

- Changed source hashes, missing translations, ambiguous option anchors, unsupported taxonomy, and malformed sources/rights must fail before content is written.
- Missing images, duplicate destination names, path traversal, existing entries, and invalid output directories must fail without overwriting user files.
- Independent defaults must exist before template substitution; source text and final newline must remain intact.
- Profiling must count response IDs once, keep cached/reasoning subsets separate, reject cumulative counters, and distinguish workflow development from entry import.
- Concurrent command logs must not overwrite one another; failures retain timings and exit status, and report output stays under ignored tests/test-results.
- Final accounting must use one incremental reader with a bounded lifetime; missing usage is unavailable, never an invented zero.

The generic content suite already renders every combination in both languages during `pnpm verify`. This runner checks each option through the UI instead of repeating that Cartesian product in a browser. Optional independent expectations add source hashes, default text, and required clauses without per-entry test code.

Expectation files and independent default text are copied into the run's inputs/ directory; the replay command uses that snapshot rather than temporary scratch files.

[PROTOCOL]: Update this header when making changes, then check README.md.
