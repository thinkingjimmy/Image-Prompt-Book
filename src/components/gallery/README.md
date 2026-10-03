# src/components/gallery/

> L2 | 父级: ../../../AGENTS.md

成员清单
gallery-view.tsx: 首页/分类主视图，resolveListing() 分离列表 canonical 与归因 landingSearch，重定向仍保留允许的 UTM/click 参数；超范围 404、空态与页脚 H1
prompt-card.tsx: 卡片（主图→标题→单行标签→作者/来源），一个 Prompt 一张卡，+N 多图角标；封面带 input 原图时主图为静态左右对比，comparison 为 stack 时为上下接缝
card-link.tsx: 真实详情 anchor；普通左键记录“从列表打开”与触发元素，修饰键点击保持原生新标签
example-image.tsx: next/image 封装，aspect-ratio 预留空间，加载失败保留布局并显示真实失败提示（含水合前失败检测）
compare-frame.tsx: 原图 / 效果左右对比画面（效果铺满，原图按 position 从左裁出，分隔线 + 圆形把手）；卡片用固定 50% 的静态版，详情的 compare-slider 复用它
compare-stack.tsx: 上下接缝。参考图在上、结果在下，两张都完整显示，接缝上是向下的圆形箭头（与左右对比同一套把手）。仅 examples.json 的 comparison 为 stack 时使用。2026-10-02 从样稿选定；否决了中间标注（两张分开的卡片加说明，更高）和上小下大（手机两列时参考图过小）。左右擦除仍留给构图对齐的前后对比
list-controls.tsx: TagFilters（AND 切换、规范顺序）、Pagination（rel=prev/next 真实链接）、EmptyState

[PROTOCOL]: Update this header when making changes, then check README.md.
