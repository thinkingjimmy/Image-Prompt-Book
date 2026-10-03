# tests/analytics/

> L2 | Parent: [../README.md](../README.md)

Focused browser checks for analytics isolation, campaign attribution and prompt usage events. All Google collection requests are intercepted. Production-origin checks serve the local production build through browser routing; they never visit the live website or send test events to GA4.

Members

network.ts: Shared Google Analytics request blocker for fixture and real-content browser verification.
fixture.spec.ts: Fixture HTML and browser isolation, campaign retention and the existing SEO indexing matrix.
production.spec.ts: Local production-build checks for origin gating, successful/failed actions, safe event identifiers and one tag initialization across navigation; preserves action payloads before shared-link reload.

## Failure inventory

Recorded before application implementation:

- Production-like fixture builds must not include the measurement ID or initialize the Google tag.
- A real production build opened on localhost or a preview origin must not initialize or request analytics.
- Genuine production-origin access must still initialize the configured measurement ID exactly once.
- Every browser verification path must block Google collection even if a future application regression injects a tag.
- Valid UTM and click attribution must survive the first response and any necessary list normalization redirect.
- Unknown query parameters must still be removed; search, sort, tags, canonical, hreflang and sitemap must retain existing rules.
- Successful copy/share actions must record one matching event; clipboard failure must record no success.
- ChatGPT handoff must record one open event without uploading the prompt, share hash or outbound prefill URL.
- Selecting an unchanged option or applying saved/shared settings must not record a user edit.
- Option changes must record identifiers for the prompt, locale, variant, parameter and selected option exactly once.
- Missing or failing analytics must not break copying, sharing, options or native link navigation.
- Route navigation and options must not reinitialize the Google tag or add a second application pageview mechanism.

Run: `pnpm test:analytics`. JSON attachments, the JSON run report, traces and screenshots are saved under the ignored `tests/test-results/analytics/` directory. Checks verify the application tag queue; receiving events inside GA4 is a separate production check after deployment.

[PROTOCOL]: Update this header when making changes, then check README.md.
