/**
 * [INPUT]: Registered image dimensions and content-versioned media URLs.
 * [OUTPUT]: WebP quality, candidate widths, image stages and responsive source attributes.
 * [POS]: Shared image-delivery contract for static media generation and browser image selection.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
export const IMAGE_QUALITY = 82;
const WIDTHS = [48, 96, 192, 384, 640, 960, 1280, 1920, 2560];
const LIMITS = { thumbnail: 192, card: 960, preview: 1280, zoom: 2560 };
export type ImageStage = keyof typeof LIMITS;

export function imageWidths(width: number): number[] {
  const maximum = Math.min(width, LIMITS.zoom);
  return [...WIDTHS.filter((value) => value < maximum), maximum];
}

export function variantUrl(src: string, version: string, width: number): string {
  return `${src}.${version}.w${width}.webp`;
}

export function parseVariant(file: string) {
  const match = /^(.+)\.([a-f0-9]{12})\.w(\d+)\.webp$/.exec(file);
  return match ? { file: match[1]!, version: match[2]!, width: Number(match[3]) } : null;
}

/** Fixtures and unknown sources keep their existing failure/fallback behavior. */
export function responsiveImage(src: string, width: number, stage: ImageStage): { src: string; srcSet?: string } {
  const match = parseVariant(src);
  if (!match) return { src };
  const base = src.replace(/\.[a-f0-9]{12}\.w\d+\.webp$/, "");
  const candidates = imageWidths(Math.min(width, LIMITS[stage]));
  return {
    src: variantUrl(base, match.version, candidates.at(-1)!),
    srcSet: candidates.map((candidate) => `${variantUrl(base, match.version, candidate)} ${candidate}w`).join(", "),
  };
}
