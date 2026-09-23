# src/components/prompt/workbench/

> L2 | 父级: ../README.md

成员清单
prompt-state.tsx: 唯一状态源（selections 与提示；Prompt 语言固定为站点语言），初始化优先级 hash → 当前版本草稿 → 默认值，监听 hashchange，写 sessionStorage 草稿
customize-view.tsx: ImageFX 式 Prompt 正文：选项为句内可换行的高亮文本（span 触发器，箭头与末字不断行），显示实际措辞
prompt-actions.tsx: part=primary（复制 Prompt、Use in ChatGPT 预填并同时复制）/ part=tools（幽灵图标：恢复默认、分享菜单），剪贴板失败时手动复制对话框

[PROTOCOL]: Update this header when making changes, then check README.md.
