# src/components/layout/

> L2 | Parent: [../README.md](../README.md)

Members

sidebar/: Shared desktop navigation and mobile drawer with icon-led browsing and left-aligned X/GitHub/language/text About utilities; see sidebar/README.md.
header/: Viewport-inset section name, compact mobile navigation trigger and expandable icon search; see header/README.md. Tag/sort controls belong to gallery/list-controls.
language-switcher.tsx: Icon-only LanguageSwitcher opens an upward dropdown of configured native locale names with a current-language checkmark and 32px controls with 44px hit areas; native links preserve the path, slug and query on full navigation.
site-footer.tsx: FooterLead composes the Line heading/index-link row; SiteFooter renders one license statement with 16px bottom/safe-area spacing.
json-ld.tsx: Structured-data script injection with escaped `<` characters.
controls/: Shared keyboard focus modality for search and tag dropdown; see controls/README.md.
analytics.tsx: afterInteractive analytics restricted to real production builds and the production browser origin; never loads for fixture/E2E content.

[PROTOCOL]: Update this header when making changes, then check README.md.
