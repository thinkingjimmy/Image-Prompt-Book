# src/components/layout/

> L2 | 父级: ../../../AGENTS.md

成员清单
header/: 顶部导航子模块（site-header、header-shell、search-box、filter-menu、sort-select），详见 header/README.md
language-switcher.tsx: 页脚语言下拉，整页切换并保留路径、slug 与列表参数
site-footer.tsx: 页脚链接、“代码 MIT / 内容各自许可”声明与语言下拉；紧跟 data-footer-lead 时去掉自身分隔线并上收，与之连成一个页脚
json-ld.tsx: 结构化数据注入（转义 `<`）
analytics.tsx: Google Analytics（afterInteractive），仅真实生产构建且无 E2E/fixture/预览标记输出；实际浏览器 origin 必须为 https://imagepromptbook.com 才加载与初始化 gtag

[PROTOCOL]: Update this header when making changes, then check README.md.
