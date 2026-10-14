"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-config";
import { NavIcon } from "@/components/layout/nav-icons";
import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

// Desktop-only chrome. Below md the bottom navigation takes over (see bottom-nav.tsx).
export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <aside className="hidden w-60 shrink-0 bg-sidebar md:sticky md:top-0 md:block md:h-screen md:self-start">
      <div className="flex h-full flex-col p-4">
        <p className="mb-5 px-3 text-sm font-semibold tracking-wide text-accent-fg">{t.appName}</p>
        <nav aria-label={t.appName} className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active ? "bg-accent text-accent-fg" : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active",
                )}
              >
                <NavIcon name={item.key} />
                {t.sidebar[item.key]}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
