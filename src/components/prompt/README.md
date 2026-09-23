# src/components/prompt/

> L2 | 父级: ../../../README.md

详情内容（参考 ImageFX，极简）：左侧案例图，右侧标题 + 可编辑 Prompt + 操作。独立详情页与路由弹窗渲染同一 PromptDetail；编辑状态与操作在 workbench/。

成员清单
prompt-detail.tsx: 共用详情（服务端）：左栏图片按自身比例满铺（CSS 变量 --ar/--detail-h 定宽）；右栏标题、作者·许可·已改编·需参考图一行（CC BY-NC 署名）、Prompt 工具行（重置/分享）、可编辑 Prompt（自绘滚动）、主操作；toPromptData() 只下发站点语言模板
detail-modal.tsx: 拦截路由弹窗外壳（桌面 min(1240px,94vw)×min(88dvh,880px)，窄屏全屏，自绘滚动条），仅从列表打开时 back() 关闭，关闭后焦点还给卡片，嵌套层打开时不响应 Esc；ModalTitle
example-gallery.tsx: 图片区：图片即左栏（cover 满铺），缩略图与“图片来源”悬浮于图上，点击放大；参数变化不改图
workbench/: 参数化编辑工作台（见 workbench/README.md）

[PROTOCOL]: Update this header when making changes, then check README.md.
