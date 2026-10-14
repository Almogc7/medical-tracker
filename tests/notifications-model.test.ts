import { describe, expect, it } from "vitest";

import { groupByDay, severityTone, toNotificationItems, unreadCount, type NotificationRow } from "@/components/notifications/notifications-model";

// Israel is UTC+3 on these dates, so 06:05Z is 09:05 in Israel. Times below are explicit UTC instants, independent of the machine timezone.
const NOW = new Date(Date.UTC(2026, 9, 13, 12, 0, 0)); // 15:00 in Israel
const at = (daysAgo: number, h = 6, m = 5) => new Date(Date.UTC(2026, 9, 13 - daysAgo, h, m, 0));

const row = (id: string, daysAgo: number, over: Partial<NotificationRow> = {}): NotificationRow => ({
  id,
  title: `T ${id}`,
  message: `M ${id}`,
  isRead: false,
  severity: "medium",
  createdAt: at(daysAgo),
  ...over,
});

describe("toNotificationItems", () => {
  it("labels today, yesterday and older days, and keeps the original timestamp format", () => {
    const items = toNotificationItems([row("a", 0), row("b", 1), row("c", 4)], NOW);
    expect(items.map((i) => i.dayKey)).toEqual(["today", "yesterday", "2026-10-09"]);
    expect(items[0]).toMatchObject({ time: "09:05", timestamp: "2026-10-13 09:05" });
  });

  it("uses calendar days, not 24-hour windows (late last night is still yesterday)", () => {
    const late = row("x", 1, { createdAt: new Date("2026-10-12T20:59:00Z") }); // 23:59 in Israel, the 12th
    const early = row("y", 0, { createdAt: new Date("2026-10-12T21:01:00Z") }); // 00:01 in Israel, the 13th
    expect(toNotificationItems([early, late], NOW).map((i) => i.dayKey)).toEqual(["today", "yesterday"]);
  });

  it("uses Israel time even when the machine runs in UTC (a 22:30Z item is already tomorrow in Israel)", () => {
    const [item] = toNotificationItems([row("z", 0, { createdAt: new Date("2026-10-12T22:30:00Z") })], new Date("2026-10-13T08:00:00Z"));
    expect(item).toMatchObject({ dayKey: "today", time: "01:30", timestamp: "2026-10-13 01:30" });
  });

  it("passes through the fields the API/DB already provide", () => {
    const [item] = toNotificationItems([row("a", 0, { isRead: true, severity: "critical" })], NOW);
    expect(item).toMatchObject({ id: "a", title: "T a", message: "M a", isRead: true, severity: "critical" });
  });
});

describe("groupByDay", () => {
  it("groups consecutive items of the same day and preserves order", () => {
    const groups = groupByDay(toNotificationItems([row("a", 0), row("b", 0), row("c", 1), row("d", 1), row("e", 6)], NOW));
    expect(groups.map((g) => [g.dayKey, g.items.map((i) => i.id)])).toEqual([
      ["today", ["a", "b"]],
      ["yesterday", ["c", "d"]],
      ["2026-10-07", ["e"]],
    ]);
  });
  it("returns no groups for no items", () => {
    expect(groupByDay([])).toEqual([]);
  });
});

describe("unreadCount / severityTone", () => {
  it("counts unread items", () => {
    expect(unreadCount([{ isRead: false }, { isRead: true }, { isRead: false }])).toBe(2);
    expect(unreadCount([])).toBe(0);
  });
  it("maps every severity to a tone consistent with the urgency standard", () => {
    expect(severityTone).toEqual({ critical: "urgent", high: "expiring", medium: "expiring", low: "active" });
  });
});
