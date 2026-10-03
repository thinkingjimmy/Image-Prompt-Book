/**
 * [INPUT]: next/script and site configuration for the measurement ID, allowed origin and analytics eligibility.
 * [OUTPUT]: Analytics with one origin-gated Google tag initialization after hydration.
 * [POS]: Root-layout analytics; fixture, E2E, preview and local access do not collect production data.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import Script from "next/script";
import { GA_MEASUREMENT_ID, GA_ORIGIN, isAnalyticsEnabled } from "@/lib/site";

export function Analytics() {
  if (!isAnalyticsEnabled()) return null;
  // Production HTML can be opened locally; verify the browser origin before requesting the tag.
  return (
    <Script id="gtag-init" strategy="afterInteractive">
      {`if(window.location.origin===${JSON.stringify(GA_ORIGIN)}){window.dataLayer=window.dataLayer||[];window.gtag=function(){window.dataLayer.push(arguments);};window.gtag('js',new Date());window.gtag('config',${JSON.stringify(GA_MEASUREMENT_ID)});var tag=document.createElement('script');tag.async=true;tag.src=${JSON.stringify(`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`)};document.head.appendChild(tag);}`}
    </Script>
  );
}
