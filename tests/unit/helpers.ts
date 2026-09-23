/**
 * [INPUT]: 依赖 @/lib/content/load 的 loadContentLibrary，依赖 @/lib/prompt/template 的 composePrompt/defaultSelections
 * [OUTPUT]: 对外提供 library（真实 content/）、promptEntry()、combinations()、composer()
 * [POS]: tests/unit 的共享工具；内容级测试都从这里取条目与组合，避免各自重复加载
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import type { Locale } from "@/i18n/config";
import type { Parameter } from "@/lib/content/schema";
import { loadContentLibrary, type PromptEntry, type PromptVariant } from "@/lib/content/load";
import { composePrompt, defaultSelections, type Selections } from "@/lib/prompt/template";

export const library = loadContentLibrary({ root: path.resolve("content"), allowFixtures: false });

export function promptEntry(slug: string): PromptEntry {
  const entry = library.entries.find((item) => item.meta.slug === slug);
  if (!entry) throw new Error(`content entry ${slug} not found`);
  return entry;
}

/** Every selection a reader can make: the cartesian product of all options. */
export function combinations(parameters: Parameter[]): Selections[] {
  return parameters.reduce<Selections[]>((all, parameter) => all.flatMap((combo) => parameter.options.map((option) => ({ ...combo, [parameter.id]: option.id }))), [{}]);
}

/** `compose(changes, locale)` renders the record with defaults overridden by `changes`. */
export function composer(record: Pick<PromptVariant, "parameters" | "templates">) {
  return (changes: Selections, outputLocale: Locale) => composePrompt({ record, selections: { ...defaultSelections(record.parameters), ...changes }, outputLocale });
}
