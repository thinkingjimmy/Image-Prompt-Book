/**
 * [INPUT]: NextConfig, next-intl/plugin and IPB_DEPLOY_ENV/IPB_DIST_DIR environment variables.
 * [OUTPUT]: Next configuration for redirects, security/indexing headers, loopback development origins, image delivery, isolated builds and a bottom-right dev indicator.
 * [POS]: Root runtime configuration; site URL/content-root rules live in src/lib/site.ts.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const indexable = process.env.IPB_DEPLOY_ENV === "production";

const nextConfig: NextConfig = {
  // The in-app preview uses the loopback IP instead of localhost.
  allowedDevOrigins: ["127.0.0.1"],
  // E2E builds against fixture content use their own output directory so they never overwrite a real build.
  distDir: process.env.IPB_DIST_DIR ?? ".next",
  poweredByHeader: false,
  // Keep developer tools clear of the sidebar's language and utility controls.
  devIndicators: { position: "bottom-right" },
  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [{ pathname: "/media/**", search: "" }],
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
