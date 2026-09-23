/**
 * [INPUT]: 依赖 @/i18n/navigation 的 Link，依赖同目录 LanguageSwitcher，依赖 @/lib/site 的 REPO_URL
 * [OUTPUT]: 对外提供 SiteFooter 服务端组件
 * [POS]: components/layout 的页脚：许可声明、About/Contribute/Licenses/GitHub 链接与语言下拉（语言切换只在这里）
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import type { Locale } from "@/i18n/config";
import { Link } from "@/i18n/navigation";
import { REPO_URL } from "@/lib/site";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "nav" });
  const link = "rounded-sm hover:text-foreground";
  return (
    <footer className="mt-16 border-t border-border/60">
      {/* items-start keeps the language menu at its natural width when the footer stacks on phones. */}
      <div className="mx-auto flex max-w-[1800px] flex-col items-start gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="flex flex-col gap-2">
          <p>{t("footerNote")}</p>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/about" className={link}>{t("about")}</Link>
            <Link href="/contribute" className={link}>{t("contribute")}</Link>
            <Link href="/licenses" className={link}>{t("licenses")}</Link>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={link}>{t("github")}</a>
          </nav>
        </div>
        <Suspense fallback={<div className="h-10 w-36" />}>
          <LanguageSwitcher />
        </Suspense>
      </div>
    </footer>
  );
}
