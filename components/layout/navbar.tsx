"use client";

import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { LogoutIcon } from "@/components/layout/nav-icons";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/ui/locale-provider";

export function Navbar({
  unreadNotifications,
  notificationPreview,
  userEmail,
}: {
  unreadNotifications: number;
  notificationPreview: { id: string; title: string; message: string }[];
  userEmail: string;
}) {
  const { t } = useLocale();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border bg-surface/95 ps-[max(1rem,env(safe-area-inset-left))] pe-[max(1rem,env(safe-area-inset-right))] backdrop-blur sm:gap-3 md:ps-6 md:pe-6">
      {/* The desktop sidebar already shows the app name; on phones the bar carries it. */}
      <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-wide text-accent md:hidden">{t.appName}</p>

      <div className="flex items-center gap-1 sm:gap-2 md:ms-auto">
        <LanguageSwitcher />
        <NotificationBell unread={unreadNotifications} items={notificationPreview} />
        <span dir="ltr" className="hidden max-w-56 truncate text-xs text-foreground-muted lg:block">{userEmail}</span>
        <form action="/api/auth/logout" method="post">
          <Button type="submit" variant="secondary" size="sm" aria-label={t.navbar.logout} className="w-11 px-0 md:w-auto md:px-3">
            <LogoutIcon className="md:hidden rtl:-scale-x-100" />
            <span className="hidden md:inline">{t.navbar.logout}</span>
          </Button>
        </form>
      </div>
    </header>
  );
}
