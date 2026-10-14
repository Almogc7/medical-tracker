"use client";

import { NotificationsView } from "@/components/notifications/notifications-view";
import type { NotificationItem } from "@/components/notifications/notifications-model";

/**
 * The real mark-as-read call, unchanged from before:
 *   POST /api/notifications/read   { id }   ->  { ok: true }
 * It now throws on a non-2xx response, so an item is only shown as read when the server confirmed it.
 */
async function markAsRead(id: string): Promise<void> {
  let response: Response;
  try {
    response = await fetch("/api/notifications/read", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  } catch {
    throw new Error("network");
  }
  if (!response.ok) throw new Error("request failed");
}

export function NotificationList({ items }: { items: NotificationItem[] }) {
  return <NotificationsView items={items} onMarkAsRead={markAsRead} />;
}
