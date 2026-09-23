/**
 * [INPUT]: 依赖 next/script 的 Script，依赖 @/lib/site 的 GA_MEASUREMENT_ID/isProductionDeploy
 * [OUTPUT]: 对外提供 Analytics 组件（Google Analytics gtag.js）
 * [POS]: components/layout 的统计注入，被根布局渲染；仅生产部署输出，预览、本地与 E2E 不上报
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import Script from "next/script";
import { GA_MEASUREMENT_ID, isProductionDeploy } from "@/lib/site";

export function Analytics() {
  if (!isProductionDeploy()) return null;
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`} strategy="afterInteractive" />
      <Script id="gtag-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}
