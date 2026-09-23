# src/components/ui/

> L2 | 父级: ../../../README.md

shadcn/ui 生成组件（`components.json`：style new-york、baseColor stone、CSS variables、lucide 图标，底层 radix-ui 1.x）。用 `pnpm dlx shadcn@4.21.0 add <name>` 添加，业务样式在调用处覆盖。

成员清单
button.tsx: Button 与 buttonVariants
dialog.tsx: Dialog 组合件（用于手动复制回退）
select.tsx: Select 组合件（参数下拉、排序）
tabs.tsx: Tabs 组合件（当前未使用，保留 shadcn 原样）
dropdown-menu.tsx: DropdownMenu 组合件（筛选、语言、分享与署名菜单）
scroll-area.tsx: 自研滚动容器（原生滚动 + 自绘可拖拽细滚动条），用于详情弹窗与 Prompt 面板

[PROTOCOL]: Update this header when making changes, then check README.md.
