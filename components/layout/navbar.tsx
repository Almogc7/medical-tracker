"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { useLocale } from "@/components/ui/locale-provider";

export function Navbar({
  unreadNotifications,
  notificationPreview,
  userEmail,
  mobileMenuOpen,
  onMenuToggle,
}: {
  unreadNotifications: number;
  notificationPreview: { id: string; title: string; message: string }[];
  userEmail: string;
  mobileMenuOpen: boolean;
  onMenuToggle: () => void;
}) {
  const { t } = useLocale();

  return (
    <header className="flex h-14 items-center justify-between gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <button
        type="button"
        onClick={onMenuToggle}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-border-subtle md:hidden"
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? t.navbar.closeMenu : t.navbar.menu}
      >
        <span className="flex flex-col gap-1" aria-hidden="true">
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
          <span className="block h-0.5 w-4 bg-current" />
        </span>
      </button>

      <div className="flex flex-1 items-center justify-end gap-2">
        <LanguageSwitcher />
        <NotificationBell unread={unreadNotifications} items={notificationPreview} />
        <span className="hidden text-xs text-slate-400 sm:block">
          {userEmail}
        </span>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="rounded-lg border border-border px-3 py-1.5 text-xs text-slate-600 transition-colors hover:bg-border-subtle"
          >
            {t.navbar.logout}
          </button>
        </form>
      </div>
    </header>
  );
}
