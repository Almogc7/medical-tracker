"use client";

import { useEffect, useState } from "react";

import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { LocaleProvider } from "@/components/ui/locale-provider";
import type { LocaleContextValue } from "@/types/i18n";

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <LocaleProvider value={localeContext}>
      <div className="min-h-screen overflow-x-hidden bg-slate-100">
        <div className="md:flex md:min-h-screen">
          <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
          <div className="flex-1">
            <Navbar
              unreadNotifications={unreadNotifications}
              notificationPreview={notificationPreview}
              userEmail={userEmail}
              mobileMenuOpen={mobileMenuOpen}
              onMenuToggle={() => setMobileMenuOpen((current) => !current)}
            />
            <main className="p-3 sm:p-4 md:p-6">{children}</main>
          </div>
        </div>
      </div>
    </LocaleProvider>
  );
}
