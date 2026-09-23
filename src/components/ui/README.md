# src/components/ui/

> L2 | 父级: ../../../AGENTS.md

shadcn/ui 生成组件（`components.json`：style new-york、baseColor stone、CSS variables、lucide 图标，底层 radix-ui 1.x）。用 `pnpm dlx shadcn@4.21.0 add <name>` 添加，业务样式在调用处覆盖。

成员清单
button.tsx: Button 与 buttonVariants
dialog.tsx: Dialog 组合件（投稿弹窗、手动复制回退；遮罩为毛玻璃 .glass-overlay）
dropdown-menu.tsx: DropdownMenu 组合件（筛选、语言、排序、参数下拉），唯一偏离上游：默认非模态，不锁页面滚动以免毛玻璃层闪烁
menu-radio-item.tsx: 自研 MenuRadioItem，右侧对勾的单选菜单项，被参数下拉与排序共用
scroll-area.tsx: 自研滚动条：ScrollArea（元素级）与 PageScrollbar（整页，系统滚动条在 globals.css 中隐藏），共用可拖拽细滚动条

[PROTOCOL]: Update this header when making changes, then check README.md.
