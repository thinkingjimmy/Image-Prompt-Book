/**
 * [INPUT]: Runtime site/deploy/content/E2E environment, node:path and the i18n Locale type.
 * [OUTPUT]: Site constants (including the collection curator), GA_MEASUREMENT_ID/GA_ORIGIN, siteUrl(), deployment/analytics/content guards and URL helpers.
 * [POS]: Shared server configuration for SEO, content isolation, analytics eligibility and repository links.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import type { Locale } from "@/i18n/config";

export const SITE_NAME = "Image Prompt Book";
export const REPO_URL = "https://github.com/thinkingjimmy/Image-Prompt-Book";
export const GA_MEASUREMENT_ID = "G-9XPFRGZTK3";
export const GA_ORIGIN = "https://imagepromptbook.com";
// The author posts in English and Chinese from separate accounts; each locale greets the matching one.
export const AUTHOR_X_URL: Record<Locale, string> = { en: "https://x.com/hellojimmywong", "zh-CN": "https://x.com/thinkingjimmy" };
/** Who selects and writes the collections; the original prompt authors are credited per prompt. */
export const CURATOR_NAME = "Jimmy Wong";
const FIXTURE_ROOT = path.join("tests", "fixtures");

export function isProductionDeploy(): boolean {
  return process.env.IPB_DEPLOY_ENV === "production";
}

export function isAnalyticsEnabled(): boolean {
  return isProductionDeploy()
    && process.env.NODE_ENV === "production"
    && process.env.IPB_E2E !== "1"
    && !process.env.IPB_CONTENT_DIR
    && (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production")
    && siteUrl().origin === GA_ORIGIN;
}

export function siteUrl(): URL {
  // Hosts may define SITE_URL as an empty string; treat that as unset. Vercel previews fall back to their own URL.
  const vercelUrl = process.env.VERCEL_URL?.trim();
  const raw = process.env.SITE_URL?.trim() || (vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000");
  if (isProductionDeploy() && !process.env.SITE_URL?.trim()) {
    throw new Error("SITE_URL is required when IPB_DEPLOY_ENV=production");
  }
  if (!URL.canParse(raw)) {
    throw new Error(`SITE_URL is not a valid absolute URL (got "${raw}")`);
  }
  const url = new URL(raw);
  if (isProductionDeploy() && url.protocol !== "https:") {
    throw new Error(`SITE_URL must be HTTPS in production (got ${raw})`);
  }
  url.pathname = "/";
  url.search = "";
  url.hash = "";
  return url;
}

export function absoluteUrl(pathname: string): string {
  return new URL(pathname, siteUrl()).toString();
}

export type ContentConfig = {
  root: string;
  isFixture: boolean;
  previewDrafts: boolean;
};

export function contentConfig(): ContentConfig {
  const override = process.env.IPB_CONTENT_DIR;
  if (override) {
    const root = path.resolve(override);
    if (!path.relative(process.cwd(), root).startsWith(FIXTURE_ROOT)) {
      throw new Error("IPB_CONTENT_DIR may only point inside tests/fixtures");
    }
    if (isProductionDeploy() && process.env.IPB_E2E !== "1") {
      throw new Error("Fixture content cannot be used by a production deployment");
    }
    return { root, isFixture: true, previewDrafts: false };
  }
  return {
    root: path.resolve("content"),
    isFixture: false,
    previewDrafts: process.env.NODE_ENV === "development" && process.env.IPB_PREVIEW_DRAFTS === "1",
  };
}

/** Public URL of an example image; `src` is `images/<file>` inside the entry folder, served by app/media. */
export function mediaUrl(slug: string, src: string): string {
  return `/media/${slug}/${path.posix.basename(src)}`;
}

export function repoFileUrl(repoPath: string): string {
  return `${REPO_URL}/tree/main/${repoPath}`;
}

export function repoIssueUrl(template?: string): string {
  return template ? `${REPO_URL}/issues/new?template=${template}` : `${REPO_URL}/issues/new/choose`;
}

/** Anchors are GitHub's slugs of the README headings; keep them in sync when renaming a section. */
const README_SECTIONS: Record<Locale, { file: string; security: string; license: string }> = {
  en: { file: "README.md", security: "security", license: "license" },
  "zh-CN": { file: "README.zh-CN.md", security: "安全问题", license: "许可" },
};

export function repoReadmeUrl(locale: Locale, section: "security" | "license"): string {
  const readme = README_SECTIONS[locale];
  return `${REPO_URL}/blob/main/${readme.file}#${readme[section]}`;
}
