/**
 * [INPUT]: 依赖 node:fs 读取内容文件，依赖 zod 的 schema 类型
 * [OUTPUT]: 对外提供 readJson()（解析 + 单文件 schema 校验）与 readText()（UTF-8、LF、单个结尾换行、无 BOM）
 * [POS]: lib/content 的文件读取底层，被 load.ts（条目）与 collections.ts（专题）共用；问题写入调用方的 issues，不抛错
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { existsSync, readFileSync } from "node:fs";
import type { z } from "zod";

export function readJson<T extends z.ZodType>(file: string, schema: T, issues: string[], label: string): z.infer<T> | null {
  if (!existsSync(file)) {
    issues.push(`${label}: file not found`);
    return null;
  }
  let data: unknown;
  try {
    data = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    issues.push(`${label}: invalid JSON (${(error as Error).message})`);
    return null;
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) issues.push(`${label}: ${issue.path.join(".") || "(root)"} ${issue.message}`);
    return null;
  }
  return result.data;
}

export function readText(file: string, issues: string[], label: string): string | null {
  if (!existsSync(file)) {
    issues.push(`${label}: file not found`);
    return null;
  }
  const text = readFileSync(file, "utf8");
  if (text.includes("\r")) issues.push(`${label}: must use LF line endings`);
  if (!text.endsWith("\n") || text.endsWith("\n\n")) issues.push(`${label}: must end with exactly one newline`);
  if (text.trim().length === 0) issues.push(`${label}: is empty`);
  if (text.charCodeAt(0) === 0xfeff) issues.push(`${label}: must not start with a BOM`);
  return text;
}
