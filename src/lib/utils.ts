/**
 * [INPUT]: 依赖 clsx 与 tailwind-merge
 * [OUTPUT]: 对外提供 cn() 类名合并工具
 * [POS]: lib 的 shadcn/ui 约定工具，被 components/ui 与业务组件共用
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
