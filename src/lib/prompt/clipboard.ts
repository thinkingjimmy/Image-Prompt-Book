/**
 * [INPUT]: 依赖浏览器 navigator.clipboard
 * [OUTPUT]: 对外提供 copyText()，成功返回 true，被拒绝或不可用返回 false（不抛出）
 * [POS]: lib/prompt 的剪贴板适配层；调用方据此显示真实成功反馈或手动复制回退，绝不虚报成功
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (!navigator.clipboard?.writeText) return false;
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
