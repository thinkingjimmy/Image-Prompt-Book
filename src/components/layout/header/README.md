# src/components/layout/header/

> L2 | Parent: [../README.md](../README.md)

Members

site-header.tsx: Viewport-inset Canvas header with a section label and expandable icon search; MobileNav appears below lg; a native GET search form remains available without JS or before the search client hydrates. Browsing links live in the sidebar, tag/sort controls above the gallery.
page-title.tsx: Path-derived section label rendered as a paragraph; page H1/introduction remain in the body and are not repeated here.
search-box.tsx: 32px icon trigger with a 44px hit area; reveals a 16px/44px input, preserves drafts on close and returns focus; 300ms debounce, immediate Enter, IME handling, pagination reset and native GET fallback.

[PROTOCOL]: Update this header when making changes, then check README.md.
