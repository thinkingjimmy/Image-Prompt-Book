/**
 * [INPUT]: Playwright BrowserContext request routing.
 * [OUTPUT]: ANALYTICS_URL_PATTERN and blockAnalytics() with intercepted request URLs.
 * [POS]: Shared analytics isolation for fixture E2E and real-content prompt verification.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import type { BrowserContext } from "@playwright/test";

export const ANALYTICS_URL_PATTERN = /^https?:\/\/(?:[a-z0-9-]+\.)*(?:google-analytics\.com|googletagmanager\.com|analytics\.google\.com|stats\.g\.doubleclick\.net)\//i;

export async function blockAnalytics(context: BrowserContext): Promise<string[]> {
  const requests: string[] = [];
  context.on("request", (request) => {
    if (ANALYTICS_URL_PATTERN.test(request.url())) requests.push(request.url());
  });
  await context.route(ANALYTICS_URL_PATTERN, (route) => route.abort());
  return requests;
}
