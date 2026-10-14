"use client";

import { useCallback, useMemo, useState } from "react";

import { heebo } from "@/components/layout/app-font";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { NotificationBadgeContext } from "@/components/notifications/notification-badge";
import { LocaleProvider } from "@/components/ui/locale-provider";
import type { LocaleContextValue } from "@/types/i18n";
import { cn } from "@/utils/cn";

// Hebrew leads with Heebo (Geist has no Hebrew glyphs); English leads with Geist. Same stack otherwise.
const FONT_STACK = {
  en: "var(--font-geist-sans), var(--font-heebo), system-ui, sans-serif",
  he: "var(--font-heebo), var(--font-geist-sans), system-ui, sans-serif",
} as const;

export function AppShell({
  localeContext,
  unreadNotifications,
  notificationPreview,
  userEmail,
  children,
}: {
  localeContext: LocaleContextValue;
  unreadNotifications: number;
  notificationPreview: { id: string; title: string; message: string }[];
  userEmail: string;
  children: React.ReactNode;
}) {
  // Notifications confirmed as read on this page. They are subtracted from the server-provided count/preview, and
  // ignored as soon as the server sends a different count (a fresh render already reflects them).
  const [marks, setMarks] = useState<{ base: number; ids: string[] }>({ base: unreadNotifications, ids: [] });
  const markedIds = marks.base === unreadNotifications ? marks.ids : [];
  const unread = Math.max(0, unreadNotifications - markedIds.length);
  const preview = notificationPreview.filter((n) => !markedIds.includes(n.id));

  const markRead = useCallback(
    (id: string) =>
      setMarks((prev) => {
        const ids = prev.base === unreadNotifications ? prev.ids : [];
        return ids.includes(id) ? prev : { base: unreadNotifications, ids: [...ids, id] };
      }),
    [unreadNotifications],
  );
  const badge = useMemo(() => ({ markRead }), [markRead]);

  return (
    <LocaleProvider value={localeContext}>
      <NotificationBadgeContext.Provider value={badge}>
        {/* overflow-x-clip (not hidden) so the sticky header keeps working. */}
        <div className={cn(heebo.variable, "min-h-screen overflow-x-clip bg-canvas")} style={{ fontFamily: FONT_STACK[localeContext.locale] }}>
          <div className="md:flex md:min-h-screen">
            <Sidebar />
            <div className="min-w-0 flex-1">
              <Navbar unreadNotifications={unread} notificationPreview={preview} userEmail={userEmail} />
              {/* Bottom padding = 4rem bottom bar + 1rem gap + safe-area inset, so content clears the bar. */}
              <main className="p-3 pb-[calc(5rem+env(safe-area-inset-bottom))] sm:p-4 sm:pb-[calc(5rem+env(safe-area-inset-bottom))] md:p-6">{children}</main>
            </div>
          </div>
          <BottomNav />
        </div>
      </NotificationBadgeContext.Provider>
    </LocaleProvider>
  );
}
