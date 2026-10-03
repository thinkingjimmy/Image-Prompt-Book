/**
 * [INPUT]: Visible content catalog, registered examples/inputs, shared image variants/fingerprints, Node file reads and Sharp.
 * [OUTPUT]: Static registered originals and content-versioned WebP responses; other files, versions and widths return 404.
 * [POS]: Public media allowlist and build-time image processing; never replaces source files or relies on the hosted optimizer.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { findEntry, getVisibleEntries } from "@/lib/content/catalog";
import type { Example } from "@/lib/content/schema";
import { imageVersion } from "@/lib/images/source";
import { IMAGE_QUALITY, imageWidths, parseVariant, variantUrl } from "@/lib/images/variants";
import { contentConfig } from "@/lib/site";

const TYPES: Record<string, string> = { ".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".avif": "image/avif" };

type Params = { slug: string; file: string };

// Prerendered at build time; any image not listed here is a 404, never read from disk.
export const dynamic = "force-static";
export const dynamicParams = false;

/** Every file an entry shows: each result and, for comparisons, its input photo. */
function images(examples: Example[]) {
  return [...new Map(examples.flatMap((example) => example.input ? [example, example.input] : [example]).map((image) => [image.src, image])).values()];
}

export function generateStaticParams(): Params[] {
  const fixture = contentConfig().isFixture;
  return getVisibleEntries().flatMap((entry) => images(entry.examples).flatMap((image) => {
    const slug = entry.meta.slug;
    const file = path.posix.basename(image.src);
    const candidates = fixture ? [] : imageWidths(image.width).map((width) => ({ slug, file: variantUrl(file, imageVersion(slug, image.src), width) }));
    return [{ slug, file }, ...candidates];
  }));
}

export async function GET(_request: Request, { params }: { params: Promise<Params> }) {
  const { slug, file } = await params;
  const variant = parseVariant(file);
  const sourceFile = variant?.file ?? file;
  const src = `images/${sourceFile}`;
  const entry = findEntry(slug);
  const image = entry && images(entry.examples).find((image) => image.src === src);
  const type = TYPES[path.extname(sourceFile).toLowerCase()];
  if (!image || !type) return new Response("Not found", { status: 404 });
  if (variant && (contentConfig().isFixture || variant.version !== imageVersion(slug, src) || !imageWidths(image.width).includes(variant.width))) return new Response("Not found", { status: 404 });
  const original = await readFile(path.join(contentConfig().root, "prompts", slug, src));
  if (variant) {
    const body = await sharp(original, { animated: true }).autoOrient().resize({ width: variant.width, withoutEnlargement: true }).webp({ quality: IMAGE_QUALITY, effort: 4 }).toBuffer();
    return new Response(new Uint8Array(body), { headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" } });
  }
  const body = original;
  return new Response(new Uint8Array(body), { headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800" } });
}
