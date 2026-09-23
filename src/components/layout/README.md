# src/components/layout/

> L2 | 父级: ../../../AGENTS.md

成员清单
site-header.tsx: 顶部导航（参考 jevable.com）：左侧仅圆形图标｜居中合一筛选胶囊（搜索·分类/标签·排序）｜右侧 👋（x.com/hellojimmywong）与 + 提交；所有宽度单行吸顶，悬浮于内容之上（半透明渐变 + 渐隐模糊），窄屏筛选与排序收为图标
search-box.tsx: 搜索框，300ms debounce、Enter 立即提交、IME 组合期间不提交、replace 写 URL 并重置页码，无 JS 退化为 GET 表单
sort-select.tsx: featured/latest 排序（push），胶囊内无边框样式，仅在宽屏列表页显示（手机在筛选菜单内排序）
filter-menu.tsx: 合一筛选下拉：分类单选（路由链接，保留搜索）+ 标签多选 AND（词表顺序写入 tags，菜单保持打开）+ 手机端排序，手机上触发器收为图标，isListingPath()
language-switcher.tsx: 页脚语言下拉，整页切换并保留路径、slug 与列表参数
site-footer.tsx: 页脚链接、“代码 MIT / 内容各自许可”声明与语言下拉
json-ld.tsx: 结构化数据注入（转义 `<`）

[PROTOCOL]: Update this header when making changes, then check README.md.
