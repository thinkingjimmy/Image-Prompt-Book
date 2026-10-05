# src/components/layout/sidebar/

> L2 | Parent: [../README.md](../README.md)

Members

site-sidebar.tsx: Server-rendered fixed 240px desktop sidebar at lg+; sidebarData() provides categories/counts, collection availability and repository/locale-specific X URLs.
sidebar-nav.tsx: Shared SidebarBrand (optional className), SidebarNav (explore, collections, Compass/Layers icons and categories with 12px gaps), SidebarActions (left-aligned X/GitHub/language/text About utilities) and SidebarData; 32px controls with non-overlapping 44px hit areas.
mobile-nav.tsx: Compact open/close controls with 44px hit areas and Dialog drawer below lg, reusing desktop navigation and its language dropdown; closes after navigating, preserves the drawer when choosing the current language and respects bottom safe-area spacing.
brand-mark.png: 96px transparent centered brand asset, statically imported and displayed at 28px.

[PROTOCOL]: Update this header when making changes, then check README.md.
