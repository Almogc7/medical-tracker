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
      <aside className="hidden w-64 border-r border-slate-200 bg-white p-4 md:block">
        <h2 className="mb-4 px-2 text-lg font-semibold text-slate-900">{t.appName}</h2>
        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const label = t.sidebar[item.key];
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-sm font-medium transition",
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-950/35 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(18rem,85vw)] flex-col border-r border-slate-200 bg-white p-4 shadow-xl transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
        aria-hidden={!mobileOpen}
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">{t.appName}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700"
            aria-label={t.navbar.closeMenu}
          >
            {t.common.cancel}
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {items.map((item) => {
            const label = t.sidebar[item.key];
            const active = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-xl px-3 py-3 text-sm font-medium transition",
                  active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
