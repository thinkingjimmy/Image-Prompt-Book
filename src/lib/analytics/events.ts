/**
 * [INPUT]: The browser's origin-gated gtag queue and the i18n Locale type.
 * [OUTPUT]: trackPromptEvent(), PromptEventName and PromptEventParams for safe usage identifiers.
 * [POS]: Client event boundary for prompt actions and intentional option changes; analytics never blocks UX.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { Locale } from "@/i18n/config";

export type PromptEventName = "copy_prompt" | "open_chatgpt" | "share_prompt" | "change_prompt_option";
export type PromptEventParams = {
  prompt_slug: string;
  locale: Locale;
  variant: string;
  parameter_id?: string;
  option_id?: string;
};

export function trackPromptEvent(name: PromptEventName, context: PromptEventParams): void {
  if (typeof window === "undefined") return;
  const gtag = (window as Window & { gtag?: (action: "event", name: PromptEventName, params: PromptEventParams) => void }).gtag;
  if (typeof gtag !== "function") return;
  const params: PromptEventParams = { prompt_slug: context.prompt_slug, locale: context.locale, variant: context.variant };
  if (name === "change_prompt_option") {
    if (!context.parameter_id || !context.option_id) return;
    params.parameter_id = context.parameter_id;
    params.option_id = context.option_id;
  }
  try {
    gtag("event", name, params);
  } catch {
    // Tracking must not interrupt successful clipboard actions or native navigation.
  }
}
