/**
 * [INPUT]: 依赖 @/lib/content/catalog 的 getVisibleEntries/findEntry，依赖 @/lib/site 的 contentConfig，依赖 node:fs 读取条目目录内的 images/
 * [OUTPUT]: GET 处理器与 generateStaticParams：/media/<slug>/<file> 提供可见条目的案例图及其对比原图（input），其余一律 404
 * [POS]: app 的唯一媒体通道；图片与 Prompt 同住 content/prompts/<slug>/images/，只有站点实际展示的图片（已发布条目的案例图、本地草稿预览）可被访问
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import { findEntry, getVisibleEntries } from "@/lib/content/catalog";
import type { Example } from "@/lib/content/schema";
import { contentConfig } from "@/lib/site";

const TYPES: Record<string, string> = { ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".avif": "image/avif" };

type Params = { slug: string; file: string };

// Prerendered at build time; any image not listed here is a 404, never read from disk.
export const dynamic = "force-static";
export const dynamicParams = false;

/** Every file an entry shows: each result and, for comparisons, its input photo. */
function imageFiles(examples: Example[]): string[] {
  return examples.flatMap((example) => (example.input ? [example.src, example.input.src] : [example.src]));
}

export function generateStaticParams(): Params[] {
  return getVisibleEntries().flatMap((entry) => imageFiles(entry.examples).map((src) => ({ slug: entry.meta.slug, file: path.posix.basename(src) })));
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { slug, file } = await params;
  const src = `images/${file}`;
  const entry = findEntry(slug);
  const type = TYPES[path.extname(file).toLowerCase()];
  if (!entry || !imageFiles(entry.examples).includes(src) || !type) return new Response("Not found", { status: 404 });
  const body = await readFile(path.join(contentConfig().root, "prompts", slug, src));
  return new Response(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
}
