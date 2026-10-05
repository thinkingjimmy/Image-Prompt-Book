# src/lib/prompt/

> L2 | 父级: ../README.md

成员清单
template.ts: parseTemplate（仅 `{{parameterId}}` 白名单 token）、toParagraphs、sanitizeSelections、composePrompt（纯函数，LF + 单结尾换行）
share.ts: 分享 hash 编解码（v/template/output/p.*，固定顺序，≤2048，未知键忽略、坏值回退、版本不符拒绝）
draft.ts: sessionStorage 草稿（key 含 schemaVersion+slug+templateVersion），存储不可用时静默降级
clipboard.ts: copyText()，失败返回 false 以触发手动复制
opened-from-list.ts: 记录从列表/专题打开的详情、来源路径与可访问触发元素；决定 back()，嵌套返回后在当前弹窗内重寻标题链接归还焦点；restoreListFocus() 返回是否恢复成功

[PROTOCOL]: Update this header when making changes, then check README.md.
