/**
 * [INPUT]: 依赖 ./template 的 sanitizeSelections/Selections，依赖 @/i18n/config 的 isLocale/Locale
 * [OUTPUT]: 对外提供 encodeShareHash()、decodeShareHash()、SHARE_HASH_MAX_LENGTH、ShareDecodeResult/ShareVariant 类型
 * [POS]: lib/prompt 的分享状态编解码器，只承载版本（variant + 模板版本）、输出语言与枚举 ID，不含全文；被 prompt-state 的初始化与分享按钮消费
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { isLocale, type Locale } from "@/i18n/config";
import type { Parameter } from "@/lib/content/schema";
import { sanitizeSelections, type Selections } from "./template";

export const SHARE_HASH_VERSION = "1";
export const SHARE_HASH_MAX_LENGTH = 2048;

export type ShareVariant = { id: string; templateVersion: string; parameters: readonly Parameter[] };

type ShareContext = {
  /** The first variant is the default and is omitted from links. */
  variants: readonly ShareVariant[];
  outputLocales: readonly Locale[];
};

export type ShareDecodeResult =
  | { status: "none" }
  | { status: "invalid"; reason: "too-long" | "malformed" | "version" }
  | { status: "ok"; variantId: string; outputLocale: Locale | null; selections: Selections; fallbacks: string[] };

/** Canonical order: v, variant (non-default only), template, output, then parameters in declaration order. */
export function encodeShareHash(context: ShareContext, state: { variantId: string; outputLocale: Locale; selections: Selections }): string {
  const variant = context.variants.find((item) => item.id === state.variantId) ?? context.variants[0]!;
  const params = new URLSearchParams();
  params.set("v", SHARE_HASH_VERSION);
  if (variant !== context.variants[0]) params.set("variant", variant.id);
  params.set("template", variant.templateVersion);
  params.set("output", state.outputLocale);
  const { selections } = sanitizeSelections(variant.parameters, state.selections);
  for (const parameter of variant.parameters) params.set(`p.${parameter.id}`, selections[parameter.id]!);
  return `#${params.toString()}`;
}

export function decodeShareHash(hash: string, context: ShareContext): ShareDecodeResult {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return { status: "none" };
  if (raw.length > SHARE_HASH_MAX_LENGTH) return { status: "invalid", reason: "too-long" };

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return { status: "invalid", reason: "malformed" };
  }
  // A hash without our version marker is not a settings link (e.g. an in-page anchor).
  if (!params.has("v")) return { status: "none" };
  if (params.get("v") !== SHARE_HASH_VERSION || !params.get("template") || !params.get("output")) return { status: "invalid", reason: "malformed" };

  const variantParam = params.get("variant");
  const variant = variantParam === null ? context.variants[0] : context.variants.find((item) => item.id === variantParam);
  if (!variant) return { status: "invalid", reason: "malformed" };
  if (params.get("template") !== variant.templateVersion) return { status: "invalid", reason: "version" };

  const fallbacks: string[] = [];
  const output = params.get("output");
  // null lets the caller fall back to its own default (the UI locale) instead of an arbitrary one.
  let outputLocale: Locale | null = null;
  if (isLocale(output) && context.outputLocales.includes(output)) outputLocale = output;
  else fallbacks.push("output");

  const input: Record<string, string> = {};
  for (const parameter of variant.parameters) {
    const value = params.get(`p.${parameter.id}`);
    if (value !== null) input[parameter.id] = value;
  }
  const { selections, invalid } = sanitizeSelections(variant.parameters, input);
  return { status: "ok", variantId: variant.id, outputLocale, selections, fallbacks: [...fallbacks, ...invalid] };
}
