# .github/workflows/

> L2 | Parent: [../README.md](../README.md)

Members

ci.yml: One required verify job routes published prompt-only changes to content/build/affected-entry checks; code/shared changes and manual/release runs retain full cross-browser acceptance and image tests.

The router compares HEAD with the latest successful ancestor CI run, so a failed or cancelled code run cannot be hidden by a later content push. Missing history, API failures or unsupported changes select full verification. Content mode installs Chromium headless shell only and saves scope plus bilingual screenshots/traces. Full mode keeps Chromium, Firefox and WebKit. The token has read-only contents/actions access and no production secrets.

[PROTOCOL]: Update this header when making changes, then check README.md.
