# src/i18n/

> L2 | 父级: ../../AGENTS.md

界面文案用 next-intl（`messages/*.json`）；Prompt 模板是独立内容资源，不在这里。

成员清单
config.ts: LOCALES（en、zh-CN）、DEFAULT_LOCALE、isLocale、原生语言名
routing.ts: 显式语言前缀、关闭语言协商与 locale cookie
navigation.ts: 带语言前缀的 Link/redirect/useRouter
request.ts: 每请求加载消息（next-intl 插件入口）
locale-param.ts: requireLocale()，页面与 metadata 的语言守卫，未知语言 404

[PROTOCOL]: Update this header when making changes, then check README.md.
