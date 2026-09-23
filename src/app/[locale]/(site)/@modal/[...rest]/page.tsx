/**
 * [INPUT]: 无
 * [OUTPUT]: 默认导出 null
 * [POS]: app/[locale]/(site)/@modal 的空分支（@modal/[...rest]/page.tsx，与 children 的兜底同名以免路由歧义），保证未拦截或离开详情时不残留旧弹窗
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
export default function Empty() {
  return null;
}
