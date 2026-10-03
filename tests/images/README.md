# tests/images/

> L2 | Parent: [../README.md](../README.md)

Members

playwright.config.ts: Focused desktop/mobile image E2E against the verified real-content production build; saves JSON, screenshots and traces.
delivery.spec.ts: HTTP pixel/format/byte checks, staged loading, background reuse, original access and registered-file boundaries; blocks all Google requests.

Failure inventory before implementation

- A small candidate can return original JPEG bytes instead of resized WebP.
- A card or thumbnail can advertise or download preview/zoom-sized assets.
- A fit-mode backdrop can request an original or a second preview candidate.
- A source change can reuse an immutable URL, or arbitrary widths/files can become public.
- Zoom can lose the original-file action, image proportions or keyboard closure.
- Fixture-only checks can hide a broken real-image pipeline.

Run `pnpm verify`, then `pnpm exec playwright test -c tests/images/playwright.config.ts`. The server reuses `.next`; it does not build or send synthetic analytics. Results live under ignored `tests/test-results/images/`.

[PROTOCOL]: Update this header when making changes, then check README.md.
