/**
 * [INPUT]: 依赖 next-intl 的 useTranslations，依赖 @/i18n/navigation 的 Link
 * [OUTPUT]: 默认导出本地化 404 页面
 * [POS]: app/[locale] 的 notFound 边界，被未知条目、草稿、停用分类、超范围页码共用；HTTP 状态为真实 404
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <p className="text-sm font-medium text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="text-muted-foreground">{t("body")}</p>
      <Link href="/" className="mt-2 inline-flex h-10 items-center rounded-full bg-foreground px-4 text-sm font-medium text-background hover:opacity-90">
        {t("back")}
      </Link>
    </div>
  );
}
