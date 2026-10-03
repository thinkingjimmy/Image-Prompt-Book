# src/lib/analytics/

> L2 | Parent: [../README.md](../README.md)

Members

attribution.ts: Allowed UTM/click parameter parsing, separate from gallery state and SEO canonicals.
events.ts: Safe copy/open/share/option events; sends identifiers only and tolerates unavailable analytics.

Tag eligibility and measurement configuration live in ../site.ts; the runtime loader lives in components/layout/analytics.tsx. Initial pageviews and SPA history remain owned by GA4 enhanced measurement; this module adds no manual pageview sender.

[PROTOCOL]: Update this header when making changes, then check README.md.
