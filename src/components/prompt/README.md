# src/components/prompt/

> L2 | 父级: ../../../AGENTS.md

详情内容（参考 ImageFX，极简）：左侧案例图，右侧标题 + 可编辑 Prompt + 操作。独立详情页与路由弹窗渲染同一 PromptDetail；编辑状态与操作在 workbench/。

成员清单
prompt-detail.tsx: 共用详情（服务端）：左栏图片按自身比例满铺；右栏标题 + 分享、作者·许可一行（CC BY-NC 署名）、工具行（版本切换 + 修改后出现的重置）、可编辑 Prompt（自绘滚动）、主操作；toPromptData() 只下发站点语言模板
detail-modal.tsx: 拦截路由弹窗外壳（桌面 min(1240px,94vw)×min(88dvh,880px)，窄屏全屏，自绘滚动条），仅从列表打开时 back() 关闭，关闭后焦点还给卡片，嵌套层打开时不响应 Esc；ModalTitle
example-gallery.tsx: 图片区：图片即左栏（默认撑满，可切换“查看完整图”），缩略图托盘（自适应宽度、可横向滚动、边缘渐隐提示更多）与图片来源悬浮其上，点击放大；参数变化不改图
workbench/: 参数化编辑工作台（见 workbench/README.md）

[PROTOCOL]: Update this header when making changes, then check README.md.
