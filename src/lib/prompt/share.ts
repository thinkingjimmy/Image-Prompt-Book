/**
 * [INPUT]: 依赖 ./template 的 sanitizeSelections/Selections，依赖 @/i18n/config 的 isLocale/Locale
 * [OUTPUT]: 对外提供 encodeShareHash()、decodeShareHash()、SHARE_HASH_MAX_LENGTH、ShareDecodeResult 类型
 * [POS]: lib/prompt 的分享状态编解码器，只承载版本、输出语言与枚举 ID，不含全文；被 prompt-workbench 的状态初始化消费
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { isLocale, type Locale } from "@/i18n/config";
import type { Parameter } from "@/lib/content/schema";
import { sanitizeSelections, type Selections } from "./template";

export const SHARE_HASH_VERSION = "1";
export const SHARE_HASH_MAX_LENGTH = 2048;

type ShareContext = {
  templateVersion: string;
  parameters: readonly Parameter[];
  outputLocales: readonly Locale[];
};

export type ShareDecodeResult =
  | { status: "none" }
  | { status: "invalid"; reason: "too-long" | "malformed" | "version" }
  | { status: "ok"; outputLocale: Locale | null; selections: Selections; fallbacks: string[] };

/** Canonical order: v, template, output, then parameters in declaration order. */
export function encodeShareHash(context: ShareContext, state: { outputLocale: Locale; selections: Selections }): string {
  const params = new URLSearchParams();
  params.set("v", SHARE_HASH_VERSION);
  params.set("template", context.templateVersion);
  params.set("output", state.outputLocale);
  const { selections } = sanitizeSelections(context.parameters, state.selections);
  for (const parameter of context.parameters) params.set(`p.${parameter.id}`, selections[parameter.id]!);
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
  if (params.get("template") !== context.templateVersion) return { status: "invalid", reason: "version" };

  const fallbacks: string[] = [];
  const output = params.get("output");
  // null lets the caller fall back to its own default (the UI locale) instead of an arbitrary one.
  let outputLocale: Locale | null = null;
  if (isLocale(output) && context.outputLocales.includes(output)) outputLocale = output;
  else fallbacks.push("output");

  const input: Record<string, string> = {};
  for (const parameter of context.parameters) {
    const value = params.get(`p.${parameter.id}`);
    if (value !== null) input[parameter.id] = value;
  }
  const { selections, invalid } = sanitizeSelections(context.parameters, input);
  return { status: "ok", outputLocale, selections, fallbacks: [...fallbacks, ...invalid] };
}
