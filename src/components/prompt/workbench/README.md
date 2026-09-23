# src/components/prompt/workbench/

> L2 | 父级: ../README.md

成员清单
prompt-state.tsx: 唯一状态源：当前版本（variant）与每个版本各自的 selections（Prompt 语言固定为站点语言），初始化优先级 hash → 草稿 → 默认值，监听 hashchange，写 sessionStorage 草稿，shareUrl()
customize-view.tsx: ImageFX 式 Prompt 正文：选项为句内可换行的高亮文本（span 触发器，箭头与末字不断行），显示实际措辞；下拉为非模态 DropdownMenu 单选（不锁页面滚动，避免毛玻璃层闪烁）
prompt-actions.tsx: part=primary（复制 Prompt、Use in ChatGPT 预填并同时复制、分享图标按钮：复制带当前设置的链接，未修改时为干净链接，悬停显示“分享”）/ reset（仅修改后出现），剪贴板失败时手动复制对话框
variant-tabs.tsx: 精简版/完整版等版本切换（单版本时显示“Prompt”标签）

[PROTOCOL]: Update this header when making changes, then check README.md.
