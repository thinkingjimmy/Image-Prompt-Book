/**
 * [INPUT]: Node file/hash primitives, the content root/media URL contract and the shared WebP recipe.
 * [OUTPUT]: imageVersion() and optimizedMediaUrl() for registered content images.
 * [POS]: Server image fingerprinting; static media and rendered pages share content-versioned URLs.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { createHash } from "node:crypto";
import { readFileSync, statSync } from "node:fs";
import path from "node:path";
import { contentConfig, mediaUrl } from "@/lib/site";
import { IMAGE_QUALITY, variantUrl } from "./variants";

const versions = new Map<string, { size: number; modified: number; version: string }>();

export function imageVersion(slug: string, src: string): string {
  const file = path.join(contentConfig().root, "prompts", slug, src);
  const stat = statSync(file);
  const cached = versions.get(file);
  if (cached?.size === stat.size && cached.modified === stat.mtimeMs) return cached.version;
  const version = createHash("sha256").update(`webp-q${IMAGE_QUALITY}-v1\0`).update(readFileSync(file)).digest("hex").slice(0, 12);
  versions.set(file, { size: stat.size, modified: stat.mtimeMs, version });
  return version;
}

export function optimizedMediaUrl(slug: string, src: string, width: number): string {
  const original = mediaUrl(slug, src);
  return contentConfig().isFixture ? original : variantUrl(original, imageVersion(slug, src), Math.min(width, 1280));
}
