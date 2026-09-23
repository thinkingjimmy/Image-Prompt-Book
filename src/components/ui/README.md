# src/components/ui/

> L2 | 父级: ../../../AGENTS.md

shadcn/ui 生成组件（`components.json`：style new-york、baseColor stone、CSS variables、lucide 图标，底层 radix-ui 1.x）。用 `pnpm dlx shadcn@4.21.0 add <name>` 添加，业务样式在调用处覆盖。

成员清单
button.tsx: Button 与 buttonVariants
dialog.tsx: Dialog 组合件（投稿弹窗、手动复制回退；遮罩为毛玻璃 .glass-overlay）
select.tsx: Select 组合件（参数下拉、排序）
dropdown-menu.tsx: DropdownMenu 组合件（筛选、语言菜单）
scroll-area.tsx: 自研滚动条：ScrollArea（元素级）与 PageScrollbar（整页，系统滚动条在 globals.css 中隐藏），共用可拖拽细滚动条

[PROTOCOL]: Update this header when making changes, then check README.md.
