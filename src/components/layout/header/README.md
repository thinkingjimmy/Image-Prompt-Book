# src/components/layout/header/

> L2 | 父级: ../README.md

成员清单
site-header.tsx: 顶部导航（参考 jevable.com）：左侧仅圆形图标｜居中合一筛选胶囊（搜索·分类/标签·排序）｜右侧 👋（en → x.com/hellojimmywong，zh-CN → x.com/thinkingjimmy）与 + 提交；所有宽度单行吸顶，悬浮于内容之上（半透明渐变 + 渐隐模糊），滚动后按钮与胶囊转为毛玻璃
header-shell.tsx: 客户端吸顶外壳，渲染 <header>，页面滚动后设 data-scrolled（group/header），被 site-header 的半透明样式消费
search-box.tsx: 搜索框，300ms debounce、Enter 立即提交、IME 组合期间不提交、replace 写 URL 并重置页码，无 JS 退化为 GET 表单
filter-menu.tsx: 合一筛选下拉：分类单选（路由链接，保留搜索）+ 标签多选 AND（词表顺序写入 tags，菜单保持打开）+ 手机端排序，手机上触发器收为图标，isListingPath()
brand-mark.png: 品牌图标（96px 透明 PNG，裁自原图并居中为正方形），site-header 静态导入，显示 28px
sort-select.tsx: featured/latest 排序（push），胶囊内无边框样式，仅在宽屏列表页显示（手机在筛选菜单内排序）

[PROTOCOL]: Update this header when making changes, then check README.md.
