# src/components/ui/

> L2 | 父级: ../../../AGENTS.md

shadcn/ui 生成组件（`components.json`：style new-york、baseColor stone、CSS variables、lucide 图标，底层 radix-ui 1.x）。用 `pnpm dlx shadcn@4.21.0 add <name>` 添加，业务样式在调用处覆盖。

成员清单
button.tsx: Button 与 buttonVariants
dialog.tsx: Dialog primitives for the mobile navigation, prompt details, image viewing and manual-copy fallback; shared .glass-overlay backdrop.
dropdown-menu.tsx: DropdownMenu primitives for native language links and prompt parameters; gallery tag menus use the same Radix primitives with a ScrollArea viewport; non-modal by default to avoid scroll-lock backdrop flashes.
menu-radio-item.tsx: MenuRadioItem with a trailing checkmark for prompt-parameter choices.
scroll-area.tsx: 自研滚动条：ScrollArea（元素级）与 PageScrollbar（整页，系统滚动条在 globals.css 中隐藏），共用可拖拽细滚动条

[PROTOCOL]: Update this header when making changes, then check README.md.
