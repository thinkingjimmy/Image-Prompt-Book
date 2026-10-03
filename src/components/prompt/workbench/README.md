# src/components/prompt/workbench/

> L2 | 父级: ../README.md

成员清单
prompt-state.tsx: 唯一状态源，hash → 草稿 → 默认值；实际选项变化发送 change_prompt_option，同值选择与状态恢复不计编辑；写草稿与 shareUrl()
customize-view.tsx: ImageFX 式 Prompt 正文：选项为句内可换行的高亮文本（span 触发器，箭头与末字不断行），显示实际措辞；下拉为 DropdownMenu + MenuRadioItem 单选（非模态，不锁页面滚动）
prompt-actions.tsx: copy/open/share/reset 操作，成功复制与分享、ChatGPT 主动打开发送对应标识事件；剪贴板失败保留手动复制且不虚报成功
variant-tabs.tsx: 精简版/完整版等版本切换（单版本时显示“Prompt”标签）

[PROTOCOL]: Update this header when making changes, then check README.md.
