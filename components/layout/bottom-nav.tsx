"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, isNavActive } from "@/components/layout/nav-config";
import { NavIcon } from "@/components/layout/nav-icons";
import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

// Mobile primary navigation. Height is mirrored by the bottom padding in AppShell's <main>
// (4rem bar + safe-area inset), so content never sits underneath it.
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav
      aria-label={t.appName}
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] ps-[env(safe-area-inset-left)] pe-[env(safe-area-inset-right)] md:hidden"
    >
      <ul className="grid grid-cols-4">
        {NAV_ITEMS.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 w-full touch-manipulation flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium transition-colors",
                  active ? "text-accent" : "text-foreground-muted",
                )}
              >
                <span className={cn("flex h-8 w-14 items-center justify-center rounded-full transition-colors", active && "bg-accent-subtle")}>
                  <NavIcon name={item.key} />
                </span>
                <span className="max-w-full truncate">{t.sidebar[item.key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
