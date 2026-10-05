/**
 * [INPUT]: In-memory origin records and native card anchors.
 * [OUTPUT]: markOpenedFromList(), wasOpenedFromList() and restoreListFocus().
 * [POS]: Modal history/focus tracking for gallery and collection cards; restores accessible links even when a nested collection body remounts.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
// Memory only: a reload renders the standalone page, which never uses back().
const triggers = new Map<string, { source: string; trigger: HTMLElement }>();

export function markOpenedFromList(href: string, trigger: HTMLElement): void {
  const card = trigger.closest('article, section[id^="prompt-"]');
  const title = card?.querySelector<HTMLElement>("h2 a, h3 a");
  triggers.set(href, { source: window.location.pathname, trigger: trigger.getAttribute("aria-hidden") === "true" ? title ?? trigger : trigger });
}

export function wasOpenedFromList(href: string): boolean {
  return triggers.has(href);
}

/** Restore only after returning to the origin, never while opening another modal. */
export function restoreListFocus(href: string): boolean {
  const record = triggers.get(href);
  if (!record || record.source !== window.location.pathname) return false;
  const visible = (node: HTMLElement) => node.isConnected && node.getClientRects().length > 0;
  const dialog = Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][data-state="open"]')).reverse().find(visible);
  const scope = dialog ?? document;
  const trigger = visible(record.trigger) && scope.contains(record.trigger) ? record.trigger : Array.from(scope.querySelectorAll<HTMLAnchorElement>('a[href]:not([aria-hidden="true"]):not([tabindex="-1"])')).find((link) => link.pathname === href && visible(link));
  trigger?.focus({ preventScroll: true });
  return document.activeElement === trigger;
}
