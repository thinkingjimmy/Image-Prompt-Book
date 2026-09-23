/**
 * [INPUT]: 依赖浏览器 sessionStorage，依赖 ./template 的 sanitizeSelections，依赖 @/i18n/config 的 isLocale
 * [OUTPUT]: 对外提供 draftKey()/readDraft()/writeDraft()/clearDraft()
 * [POS]: lib/prompt 的同标签页草稿存储；所有读写都容忍存储被禁用，编辑与复制绝不依赖它
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { isLocale, type Locale } from "@/i18n/config";
import type { Parameter } from "@/lib/content/schema";
import { sanitizeSelections, type Selections } from "./template";

const SCHEMA_VERSION = 1;

export type Draft = { selections: Selections; outputLocale: Locale | null };

export function draftKey(slug: string, templateVersion: string): string {
  return `ipb:draft:${SCHEMA_VERSION}:${slug}:${templateVersion}`;
}

export function readDraft(slug: string, templateVersion: string, parameters: readonly Parameter[]): Draft | null {
  try {
    const raw = window.sessionStorage.getItem(draftKey(slug, templateVersion));
    if (!raw) return null;
    const value = JSON.parse(raw) as { selections?: Record<string, unknown>; outputLocale?: unknown };
    return {
      selections: sanitizeSelections(parameters, value.selections).selections,
      outputLocale: isLocale(value.outputLocale) ? value.outputLocale : null,
    };
  } catch {
    return null;
  }
}

export function writeDraft(slug: string, templateVersion: string, draft: Draft): void {
  try {
    window.sessionStorage.setItem(draftKey(slug, templateVersion), JSON.stringify(draft));
  } catch {
    // Storage disabled or full: editing keeps working in memory.
  }
}

export function clearDraft(slug: string, templateVersion: string): void {
  try {
    window.sessionStorage.removeItem(draftKey(slug, templateVersion));
  } catch {
    // Ignore: nothing to clear when storage is unavailable.
  }
}
