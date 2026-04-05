"use client";

import Link from "next/link";
import { useState } from "react";

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

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      >
        {t.navbar.notifications}
        {unread > 0 ? (
          <span className="absolute -top-2 -right-2 min-w-5 rounded-full bg-rose-500 px-1 text-center text-xs font-semibold text-white">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-lg">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">{t.notifications.title}</h3>
          <div className="max-h-80 space-y-2 overflow-y-auto">
            {items.length ? (
              items.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-100 bg-slate-50 p-2">
                  <p className="text-sm font-medium text-slate-800">{item.title}</p>
                  <p className="text-xs text-slate-600">{item.message}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">{t.notifications.noNotifications}</p>
            )}
          </div>
          <Link className="mt-3 inline-block text-xs font-semibold text-slate-700 underline" href="/notifications">
            {t.sidebar.notifications}
          </Link>
        </div>
      ) : null}
    </div>
  );
}
