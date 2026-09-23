/**
 * [INPUT]: 依赖 next 的 NextConfig，依赖 next-intl/plugin，依赖 IPB_DEPLOY_ENV/IPB_DIST_DIR 环境变量
 * [OUTPUT]: 默认导出 Next 配置（/→/en、安全头、非生产 X-Robots-Tag noindex、图片格式、独立 E2E 构建目录）
 * [POS]: 项目根的运行配置；站点级 URL/内容根规则在 src/lib/site.ts
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const indexable = process.env.IPB_DEPLOY_ENV === "production";

const nextConfig: NextConfig = {
  // E2E builds against fixture content use their own output directory so they never overwrite a real build.
  distDir: process.env.IPB_DIST_DIR ?? ".next",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/examples/**", search: "" }],
  },
  async redirects() {
    return [{ source: "/", destination: "/en", permanent: false }];
  },
  async headers() {
    const security = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "DENY" },
    ];
    // Previews and local builds are crawlable (so robots can read the directive) but never indexable.
    const robots = indexable ? [] : [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    return [{ source: "/:path*", headers: [...security, ...robots] }];
  },
};

export default withNextIntl(nextConfig);
