/**
 * [INPUT]: Shared dialog primitives, localized navigation messages and SidebarBrand/SidebarNav/SidebarActions/SidebarData.
 * [OUTPUT]: MobileNav, Compact open/close controls with 44px hit areas and a warm viewport-height sidebar drawer with safe-area spacing.
 * [POS]: Narrow-screen header entry; reuses desktop navigation, closes after navigating and preserves the drawer when choosing the current language.
 * [PROTOCOL]: Update this header when making changes, then check README.md.
 */
"use client";

import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SidebarActions, SidebarBrand, SidebarNav, type SidebarData } from "./sidebar-nav";

export function MobileNav(props: SidebarData) {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={t("menu")}
        className="site-control site-icon-control text-muted-foreground lg:hidden"
      >
        <Menu aria-hidden className="size-4" strokeWidth={1.7} />
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="top-0 left-0 flex h-dvh w-72 max-w-[85vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none rounded-r-lg border-0 bg-sidebar p-4 pt-5 pb-[max(1rem,env(safe-area-inset-bottom))] data-[state=closed]:slide-out-to-left data-[state=closed]:zoom-out-100 data-[state=open]:slide-in-from-left data-[state=open]:zoom-in-100 sm:max-w-72"
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a[href]")) setOpen(false);
        }}
      >
        <DialogTitle className="sr-only">{t("sidebar")}</DialogTitle>
        <div className="flex shrink-0 items-center gap-1">
          <SidebarBrand className="flex-1 [&>span]:text-base" />
          <DialogClose aria-label={t("closeMenu")} className="site-control site-icon-control text-muted-foreground">
            <X aria-hidden className="size-4" />
          </DialogClose>
        </div>
        <div className="-mx-2 mt-4 min-h-0 flex-1 overflow-y-auto px-2 pt-1.5 pb-4">
          <SidebarNav {...props} />
        </div>
        <SidebarActions repoUrl={props.repoUrl} xUrl={props.xUrl} />
      </DialogContent>
    </Dialog>
  );
}
