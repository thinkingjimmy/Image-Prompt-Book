/**
 * [INPUT]: 依赖 next-intl/navigation 的 createNavigation，依赖 ./routing
 * [OUTPUT]: 对外提供带语言前缀的 Link/redirect/usePathname/useRouter/getPathname
 * [POS]: i18n 的导航封装，业务组件统一从这里导入链接与路由，避免手写 locale 前缀
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
