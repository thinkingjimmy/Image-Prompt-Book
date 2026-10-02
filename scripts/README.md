# scripts/

> L2 | 父级: ../AGENTS.md

成员清单
import-appendix.ts: `pnpm content:import <slug>`，把规范性附录逐字导入 content/prompts/<slug>/
check-content.ts: `pnpm content:check`，构建前内容闸门，打印每个条目是否公开及原因
check-links.ts: `pnpm links:check [--slug <slug>...] [--strict]`，全站或指定条目外链巡检，只报告不修改
measure-vitals.ts: `pnpm vitals [baseUrl]`，在固定移动设备/网络/CPU 条件下记录 LCP、CLS、请求与体积
lib/appendix.ts: 附录章节/code fence 解析器，导入与保真测试共用
prompts/: `prompt:prepare` 生成已审阅条目骨架与独立期望，`prompt:profile` 记录实际时间/token，`test:prompt` 复用 verify 构建检查真实条目并保存截图/trace

[PROTOCOL]: Update this header when making changes, then check README.md.
