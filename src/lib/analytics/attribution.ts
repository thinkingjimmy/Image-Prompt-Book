/**
 * [INPUT]: RawSearchParams from the content query contract and URLSearchParams.
 * [OUTPUT]: isAttributionParam() and attributionParams() for explicitly allowed campaign/click identifiers.
 * [POS]: Separates landing attribution from gallery state and SEO canonical URLs.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { RawSearchParams } from "@/lib/content/query";

const KEYS = new Set([
  "utm_source", "utm_medium", "utm_campaign", "utm_id", "utm_term", "utm_content",
  "utm_source_platform", "utm_creative_format", "utm_marketing_tactic",
  "gclid", "dclid", "gbraid", "wbraid",
]);

export function isAttributionParam(key: string): boolean {
  return KEYS.has(key);
}

export function attributionParams(params: RawSearchParams): URLSearchParams {
  const result = new URLSearchParams();
  for (const key of KEYS) {
    const value = params[key];
    const first = Array.isArray(value) ? value[0] : value;
    if (first !== undefined) result.set(key, first);
  }
  return result;
}
