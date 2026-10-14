import { dayNumber, israelParts } from "@/utils/israel-time";

// Pure helpers for the Notifications page. They reshape the rows app/notifications/page.tsx already loads;
// no Prisma, no I/O, and nothing here changes what a notification is or how it is stored.

export type NotificationSeverity = "low" | "medium" | "high" | "critical";

export type NotificationRow = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  severity: NotificationSeverity;
  createdAt: Date;
};

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  severity: NotificationSeverity;
  /** "today", "yesterday" or the calendar date (yyyy-MM-dd). */
  dayKey: string;
  /** yyyy-MM-dd HH:mm in Israel time, same format the page used before (shown as a tooltip). */
  timestamp: string;
  /** HH:mm in Israel time */
  time: string;
};

export type NotificationGroup = { dayKey: string; items: NotificationItem[] };

export function toNotificationItems(rows: NotificationRow[], now = new Date()): NotificationItem[] {
  const today = israelParts(now).day;
  return rows.map((row) => {
    const { day, time } = israelParts(row.createdAt);
    const diff = dayNumber(today) - dayNumber(day);
    return {
      id: row.id,
      title: row.title,
      message: row.message,
      isRead: row.isRead,
      severity: row.severity,
      dayKey: diff === 0 ? "today" : diff === 1 ? "yesterday" : day,
      timestamp: `${day} ${time}`,
      time,
    };
  });
}

/** Groups consecutive items that share a day (input is already newest-first). */
export function groupByDay(items: NotificationItem[]): NotificationGroup[] {
  const groups: NotificationGroup[] = [];
  for (const item of items) {
    const last = groups[groups.length - 1];
    if (last && last.dayKey === item.dayKey) last.items.push(item);
    else groups.push({ dayKey: item.dayKey, items: [item] });
  }
  return groups;
}

export const unreadCount = (items: { isRead: boolean }[]) => items.filter((i) => !i.isRead).length;

/**
 * Visual tone per severity, consistent with the urgency standard: critical is red, high and medium are amber,
 * low is calm sage. The word (Critical/High/Medium/Low) always accompanies the color.
 */
export const severityTone: Record<NotificationSeverity, "urgent" | "expiring" | "active"> = {
  critical: "urgent",
  high: "expiring",
  medium: "expiring",
  low: "active",
};
