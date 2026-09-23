/**
 * [INPUT]: 依赖浏览器 sessionStorage，依赖 ./template 的 sanitizeSelections，依赖 ./share 的 ShareVariant
 * [OUTPUT]: 对外提供 draftKey()/readDraft()/writeDraft()
 * [POS]: lib/prompt 的同标签页草稿存储：当前版本（variant）与每个版本各自的选项；模板版本变化的选项会被丢弃；存储被禁用时静默降级
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { sanitizeSelections, type Selections } from "./template";
import type { ShareVariant } from "./share";

const SCHEMA_VERSION = 2;

export type Draft = { variantId: string; selections: Record<string, Selections> };
type StoredDraft = { variantId?: unknown; variants?: Record<string, { templateVersion?: unknown; selections?: Record<string, unknown> }> };

export function draftKey(slug: string): string {
  return `ipb:draft:${SCHEMA_VERSION}:${slug}`;
}

export function readDraft(slug: string, variants: readonly ShareVariant[]): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(slug));
    if (!raw) return null;
    const stored = JSON.parse(raw) as StoredDraft;
    const selections: Record<string, Selections> = {};
    for (const variant of variants) {
      const saved = stored.variants?.[variant.id];
      // Options saved for another template version may not mean the same thing any more.
      if (saved && saved.templateVersion === variant.templateVersion) selections[variant.id] = sanitizeSelections(variant.parameters, saved.selections).selections;
    }
    const variantId = variants.some((variant) => variant.id === stored.variantId) ? (stored.variantId as string) : variants[0]!.id;
    return { variantId, selections };
  } catch {
    return null;
  }
}

export function writeDraft(slug: string, variants: readonly ShareVariant[], draft: Draft): void {
  try {
    const stored = {
      variantId: draft.variantId,
      variants: Object.fromEntries(variants.filter((variant) => draft.selections[variant.id]).map((variant) => [variant.id, { templateVersion: variant.templateVersion, selections: draft.selections[variant.id] }])),
    };
    window.sessionStorage.setItem(draftKey(slug), JSON.stringify(stored));
  } catch {
    // Storage disabled or full: editing keeps working in memory.
  }
}
