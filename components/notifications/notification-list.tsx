"use client";

import { useState } from "react";

import { useLocale } from "@/components/ui/locale-provider";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  severity: "low" | "medium" | "high" | "critical";
};

export function NotificationList({ items }: { items: NotificationItem[] }) {
  const { t } = useLocale();
  const [state, setState] = useState(items);

  async function markAsRead(id: string) {
    await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    setState((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  }

  return (
    <div className="space-y-3">
      {state.map((item) => (
        <div
          key={item.id}
          className={`rounded-xl border p-4 shadow-sm ${item.isRead ? "border-slate-200 bg-white" : "border-amber-200 bg-amber-50"}`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-600">{item.message}</p>
              <p className="mt-2 text-xs text-slate-500">{item.createdAt}</p>
            </div>
            {!item.isRead ? (
              <button
                type="button"
                onClick={() => markAsRead(item.id)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700 sm:w-auto sm:py-1"
              >
                {t.notifications.markAsRead}
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
