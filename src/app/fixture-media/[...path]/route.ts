/**
 * [INPUT]: 依赖 @/lib/site 的 contentConfig，依赖 node:fs 读取 fixture 图片
 * [OUTPUT]: GET 处理器：仅在 fixture 内容根下提供测试图片，其余情况一律 404
 * [POS]: app 的测试专用媒体通道；生产内容根不会命中，fixture 图片不进入 public/
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { contentConfig } from "@/lib/site";

const TYPES: Record<string, string> = { ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".avif": "image/avif" };

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const config = contentConfig();
  if (!config.isFixture) return new Response("Not found", { status: 404 });
  const segments = (await params).path;
  const file = path.resolve(config.mediaRoot, ...segments);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!file.startsWith(config.mediaRoot + path.sep) || !type) return new Response("Not found", { status: 404 });
  try {
    return new Response(new Uint8Array(await readFile(file)), { headers: { "Content-Type": type, "Cache-Control": "no-store" } });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
