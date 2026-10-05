# src/components/gallery/

> L2 | 父级: ../../../AGENTS.md

成员清单
gallery-view.tsx: 首页/分类主视图，resolveListing() 分离列表 canonical 与归因 landingSearch，重定向仍保留允许的 UTM/click 参数；首张卡片高优先级，未筛选第 1 页在第 3/11/19 张案例前插入专题卡（不计入分页与 ItemList），超范围 404、空态与Line 页脚 H1 与一个真实专题索引入口
prompt-card.tsx: 卡片（主图→标题→作者/来源，无标题下标签 Badge），一个 Prompt 一张卡，+N 多图角标；版本化 WebP 与精确列宽 sizes，候选最大 960px；封面带 input 原图时主图为静态左右对比，comparison 为 stack 时为上下接缝
card-link.tsx: 真实详情 anchor；普通左键记录“从列表打开”与可访问标题触发元素，专题卡共用，修饰键点击保持原生新标签
example-image.tsx: Native responsive image with stage-bounded static WebP candidates, eager/lazy priority, loaded-source callback and reserved aspect ratio; 加载失败保留布局并显示真实失败提示（含水合前失败检测）
compare-frame.tsx: 原图 / 效果左右对比画面（效果铺满，原图按 position 从左裁出，分隔线 + 圆形把手）；卡片用固定 50% 的静态版，详情的 compare-slider 复用它
compare-stack.tsx: 上下接缝。参考图在上、结果在下，两张都完整显示，接缝上是向下的圆形箭头（与左右对比同一套把手）；两种对比均接受调用方的 sizes 与 image stage。仅 examples.json 的 comparison 为 stack 时使用。2026-10-02 从样稿选定；否决了中间标注（两张分开的卡片加说明，更高）和上小下大（手机两列时参考图过小）。左右擦除仍留给构图对齐的前后对比
list-controls/: Quiet Featured/Latest links, compact custom-scrolled tag dropdown with canonical AND links/no-JS fallback, Pagination and EmptyState; see list-controls/README.md.

[PROTOCOL]: Update this header when making changes, then check README.md.
