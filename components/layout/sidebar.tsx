"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

const items = [
  { href: "/dashboard", key: "dashboard" as const },
  { href: "/people", key: "people" as const },
  { href: "/upload", key: "upload" as const },
  { href: "/notifications", key: "notifications" as const },
];

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { t } = useLocale();

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const label = t.sidebar[item.key];
        const active = pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-accent text-accent-fg"
                : "text-sidebar-text hover:bg-sidebar-hover hover:text-sidebar-text-active",
            )}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { t } = useLocale();

  useEffect(() => {
    onClose?.();
  }, [pathname, onClose]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-60 flex-shrink-0 bg-sidebar md:block">
        <div className="flex h-full flex-col p-4">
          <p className="mb-5 px-3 text-sm font-semibold tracking-wide text-accent-fg">{t.appName}</p>
          <NavItems />
        </div>
      </aside>

      {/* Mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(15rem,85vw)] flex-col bg-sidebar p-4 shadow-xl transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <p className="text-sm font-semibold tracking-wide text-accent-fg">{t.appName}</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-xs text-sidebar-text hover:text-sidebar-text-active"
            aria-label={t.navbar.closeMenu}
          >
            {t.common.cancel}
          </button>
        </div>
        <NavItems onNavigate={onClose} />
      </aside>
    </>
  );
}
