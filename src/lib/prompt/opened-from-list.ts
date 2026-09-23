/**
 * [INPUT]: 无依赖，模块级内存
 * [OUTPUT]: 对外提供 markOpenedFromList()/wasOpenedFromList()/restoreListFocus()
 * [POS]: lib/prompt 的弹窗来源记录；只有从本站列表拦截打开的详情才允许 router.back() 关闭，避免把用户送回站外；关闭后把焦点还给触发的卡片链接
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
// Memory only: a reload renders the standalone page, which never uses back().
const triggers = new Map<string, HTMLElement>();

export function markOpenedFromList(href: string, trigger: HTMLElement): void {
  triggers.set(href, trigger);
}

export function wasOpenedFromList(href: string): boolean {
  return triggers.has(href);
}

/** Returns focus to the card that opened `href`, if it is still on the page. */
export function restoreListFocus(href: string): void {
  const trigger = triggers.get(href);
  if (trigger?.isConnected) trigger.focus({ preventScroll: true });
}
