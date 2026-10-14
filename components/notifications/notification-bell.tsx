"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { BellIcon } from "@/components/layout/nav-icons";
import { fill } from "@/components/prescriptions/prescription-format";
import { useLocale } from "@/components/ui/locale-provider";

export function NotificationBell({
  unread,
  items,
}: {
  unread: number;
  items: { id: string; title: string; message: string }[];
}) {
  const [open, setOpen] = useState(false);
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownId = "notification-dropdown";

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={dropdownId}
        aria-haspopup="true"
        aria-label={unread > 0 ? `${t.navbar.notifications} (${fill(t.notifications.unreadCount, { n: unread })})` : t.navbar.notifications}
        className="relative inline-flex size-11 touch-manipulation items-center justify-center rounded-[var(--radius-component)] text-foreground-muted transition-colors hover:bg-border-subtle"
      >
        <BellIcon />
        {unread > 0 ? (
          <span
            aria-hidden="true"
            className="absolute end-1 top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-center text-[10px] font-semibold leading-4 text-accent-fg"
          >
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          id={dropdownId}
          role="region"
          aria-label={t.notifications.title}
          aria-live="polite"
          // Pinned to the viewport on phones (the bell is not at the screen edge); anchored to the bell from sm up.
          className="fixed inset-x-3 top-16 z-30 rounded-[var(--radius-panel)] border border-border bg-surface p-3 shadow-lg sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-2 sm:w-80"
        >
          <h3 className="mb-2 text-sm font-semibold text-foreground">{t.notifications.title}</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} className="rounded-[var(--radius-component)] border border-border-subtle bg-canvas p-2">
                  <p className="text-sm font-medium text-foreground" dir="auto">{item.title}</p>
                  <p className="text-xs text-foreground-muted" dir="auto">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-foreground-subtle">{t.notifications.noNotifications}</p>
            )}
          </div>
          <Link
            className="mt-3 inline-flex min-h-11 items-center text-xs font-semibold text-accent underline"
            href="/notifications"
            onClick={() => setOpen(false)}
          >
            {t.sidebar.notifications}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
