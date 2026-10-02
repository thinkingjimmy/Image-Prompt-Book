# scripts/prompts/

> L2 | Parent: [../README.md](../README.md)

Members

check.ts: `pnpm test:prompt <slug...> [--checks <json>] [--url <local URL>]`; reads real entries and independent source expectations, records timings and browser artifacts, and reuses the completed production build.
browser.ts: Parallel bilingual entry E2E checks for all variants, options, copy/share/reset, attribution, media, comparison controls, reference input, gallery/sitemap, and 375 px layout.
server.ts: Starts one production server on a free loopback port and stops only that child process; never builds or replaces an existing server.

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

The generic content suite already renders every combination in both languages during `pnpm verify`. This runner checks each option through the UI instead of repeating that Cartesian product in a browser. Optional independent expectations add source hashes, default text, and required clauses without per-entry test code.

Expectation files and independent default text are copied into the run's inputs/ directory; the replay command uses that snapshot rather than temporary scratch files.

[PROTOCOL]: Update this header when making changes, then check README.md.
