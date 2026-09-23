/**
 * [INPUT]: 依赖 process.env 的 SITE_URL/IPB_DEPLOY_ENV/IPB_CONTENT_DIR/IPB_PREVIEW_DRAFTS，依赖 @/i18n/config 的 Locale
 * [OUTPUT]: 对外提供 SITE_NAME/REPO_URL/AUTHOR_X_URL（按语言）/siteUrl()/isProductionDeploy()/contentConfig()/mediaUrl()/absoluteUrl()/repoFileUrl()/repoIssueUrl()/repoReadmeUrl()
 * [POS]: lib 的站点运行配置单一入口；SEO、内容目录选择、fixture 隔离与 GitHub 链接都从这里取值，浏览器端只拿到公开常量
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import path from "node:path";
import type { Locale } from "@/i18n/config";

export const SITE_NAME = "Image Prompt Book";
export const REPO_URL = "https://github.com/thinkingjimmy/Image-Prompt-Book";
// The author posts in English and Chinese from separate accounts; each locale greets the matching one.
export const AUTHOR_X_URL: Record<Locale, string> = { en: "https://x.com/hellojimmywong", "zh-CN": "https://x.com/thinkingjimmy" };
const FIXTURE_ROOT = path.join("tests", "fixtures");

export function isProductionDeploy(): boolean {
  return process.env.IPB_DEPLOY_ENV === "production";
}

export function siteUrl(): URL {
  const raw = process.env.SITE_URL ?? "http://localhost:3000";
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
