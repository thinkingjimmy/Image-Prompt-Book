/**
 * [INPUT]: Localized navigation messages, the current pathname and server-provided category labels.
 * [OUTPUT]: PageTitle, the current section name without repeating the gallery introduction.
 * [POS]: Header orientation label; the page body owns its visible H1 and introduction.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

export function PageTitle({ categories }: { categories: { id: string; label: string }[] }) {
  const nav = useTranslations("nav");
  const pathname = usePathname();
  const [, section = "", id = ""] = pathname.split("/").slice(1);

  let title = nav("explore");
  if (section === "categories") title = categories.find((item) => item.id === id)?.label ?? nav("explore");
  else if (section === "collections") title = nav("collections");
  else if (section === "about" || section === "licenses") title = nav(section);

  return (
    <p className="truncate text-[17px] font-semibold tracking-tight">{title}</p>
  );
}
