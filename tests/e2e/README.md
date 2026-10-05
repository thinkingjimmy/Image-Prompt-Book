# tests/e2e/

> L2 | Parent: [../README.md](../README.md)

Members

helpers.ts: Hydrated browser fixtures, shared desktop/mobile navigation, language/tag menu access and expandable search, analytics request blocking, clipboard/storage injection and independent prompt expectations.
gallery.spec.ts: Bilingual dropdown tag/sort links, sidebar categories, attribution-preserving paging normalization, failures, prompt/collection modal navigation with nested scroll/focus restoration, language-menu links preserving editor settings across browsers, and image comparison; retains normalization screenshot evidence.
navigation.spec.ts: Bilingual icon-led browsing and compact X/GitHub/language/text About utilities, browser-error-free locale round trips, language-menu keyboard/touch/current-choice behavior, 32px controls with verified 44px hit areas, locale query preservation, one-link license footer and retired submission routes; retains screenshots and JSON evidence.
editor.spec.ts: Prompt editing, versions, copy/share, saved settings, clipboard failures and ChatGPT handoff.
seo.spec.ts: Raw HTML, visible content, canonical/hreflang, indexing matrix, sitemap (including collections), collection/detail two-way links and JSON-LD consistency.
layout.spec.ts: Canvas search/focus, borderless custom-scrolled filters, anchored surfaces/alignment/compact footer evidence, accessibility and two-to-five gallery columns based on the content width beside the sidebar, mobile dialogs and horizontal overflow.

Focused shell verification: `pnpm test:e2e navigation.spec.ts gallery.spec.ts layout.spec.ts seo.spec.ts --grep 'navigation|gallery|site language|sitemap|without JavaScript|collection pages|WCAG' --trace=on`. Screenshots, navigation JSON and traces are saved under tests/test-results/e2e.

For an already running development server with real content: `IPB_E2E_BASE_URL=http://localhost:3000 pnpm test:e2e navigation.spec.ts --grep 'navigation runtime|keeps browsing|keyboard selection|utilities work' --project=chromium --project=mobile --trace=on --output=tests/test-results/sidebar-bar`. This checks initial compilation, hydration, bottom text About navigation, compact utilities, language-menu focus/current-choice behavior and an English → Chinese → English round trip, retaining JSON, screenshots and traces. Category/query cases use fixture-specific content and require the default fixture server.

[PROTOCOL]: Update this header when making changes, then check README.md.

Canvas acceptance: `pnpm test:e2e gallery.spec.ts navigation.spec.ts layout.spec.ts seo.spec.ts --grep "navigation|gallery|detail navigation|Canvas|axe|responsive gallery|mobile|without JavaScript|collection pages|sitemap" --project=chromium --project=mobile --workers=2 --trace=on --output=tests/test-results/canvas`. Use the isolated fixture build; screenshots, scroll/focus JSON and traces make the result repeatable.
