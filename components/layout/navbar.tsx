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
    <header className="flex flex-col gap-3 border-b border-slate-200 bg-white px-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{t.appName}</p>
        <button
          type="button"
          onClick={onMenuToggle}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 md:hidden"
          aria-expanded={mobileMenuOpen}
          aria-label={mobileMenuOpen ? t.navbar.closeMenu : t.navbar.menu}
        >
          <span className="flex flex-col gap-1" aria-hidden="true">
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
            <span className="block h-0.5 w-4 bg-current" />
          </span>
          <span>{t.navbar.menu}</span>
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
        <LanguageSwitcher />
        <NotificationBell unread={unreadNotifications} items={notificationPreview} />
        <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 sm:flex-none">
          {t.navbar.hello}, {userEmail}
        </div>
        <form action="/api/auth/logout" method="post">
          <button type="submit" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700">
            {t.navbar.logout}
          </button>
        </form>
      </div>
    </header>
  );
}
