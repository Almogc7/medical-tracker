import { describe, expect, it } from "vitest";

import { buildDashboardViewModel, remainingPacks, toneForDays, type DashboardDataInput } from "@/components/dashboard/dashboard-model";

// Explicit UTC instants (09:00Z = 12:00 in Israel), so results do not depend on the machine timezone.
const NOW = new Date(Date.UTC(2026, 9, 13, 9, 0, 0));
const inDays = (n: number) => new Date(Date.UTC(2026, 9, 13 + n, 9, 0, 0));

const upcoming = (id: string, days: number, total: number, used: number, person = "Noa") => ({
  id,
  title: `Rx ${id}`,
  person,
  expirationDate: inDays(days),
  daysRemaining: `${days} days`,
  totalPacks: total,
  usedPacks: used,
});

const base = (over: Partial<DashboardDataInput> = {}): DashboardDataInput => ({
  summary: { active: 0, expiringSoon: 0, expired: 0, issued: 0 },
  urgent: [],
  upcomingExpirations: [],
  perPerson: [],
  recentActivity: [],
  ...over,
});

describe("toneForDays", () => {
  it("maps day thresholds to tones", () => {
    expect(toneForDays(-2)).toBe("expired");
    expect(toneForDays(0)).toBe("urgent");
    expect(toneForDays(3)).toBe("urgent");
    expect(toneForDays(4)).toBe("expiring");
    expect(toneForDays(14)).toBe("expiring");
    expect(toneForDays(15)).toBe("active");
  });
  it("treats unknown days (urgent-list-only items) as expiring", () => {
    expect(toneForDays(null)).toBe("expiring");
  });
});

describe("buildDashboardViewModel", () => {
  it("passes the real summary through untouched", () => {
    const summary = { active: 5, expiringSoon: 3, expired: 1, issued: 4 };
    expect(buildDashboardViewModel(base({ summary }), NOW).summary).toEqual(summary);
  });

  it("derives numeric days, tone and pack counts from real fields", () => {
    const m = buildDashboardViewModel(base({ upcomingExpirations: [upcoming("a", 2, 6, 2), upcoming("b", 19, 5, 0)] }), NOW);
    expect(m.rows.map((r) => [r.id, r.daysLeft, r.tone, r.totalPacks, r.usedPacks])).toEqual([
      ["a", 2, "urgent", 6, 2],
      ["b", 19, "active", 5, 0],
    ]);
  });

  it("sorts by expiry and picks the first row that still has packs as the hero", () => {
    const m = buildDashboardViewModel(
      base({ upcomingExpirations: [upcoming("late", 30, 4, 0), upcoming("used-up", 1, 3, 3), upcoming("soon", 5, 4, 1)] }),
      NOW,
    );
    expect(m.rows.map((r) => r.id)).toEqual(["used-up", "soon", "late"]);
    expect(m.heroId).toBe("soon");
  });

  it("falls back to the first row when every prescription is fully used, and to null when empty", () => {
    const used = buildDashboardViewModel(base({ upcomingExpirations: [upcoming("x", 2, 3, 3)] }), NOW);
    expect(used.heroId).toBe("x");
    expect(buildDashboardViewModel(base(), NOW).heroId).toBeNull();
  });

  it("keeps urgent items outside the upcoming window, with the backend label and no numeric days", () => {
    const m = buildDashboardViewModel(
      base({
        upcomingExpirations: [upcoming("a", 1, 4, 0)],
        urgent: [
          { id: "a", title: "Rx a", person: "Noa", daysRemaining: "1 days", totalPacks: 4, usedPacks: 0 },
          { id: "z", title: "Rx z", person: "Maya", daysRemaining: "6 days", totalPacks: 2, usedPacks: 0 },
        ],
      }),
      NOW,
    );
    const z = m.rows.find((r) => r.id === "z")!;
    expect(z.daysLeft).toBeNull();
    expect(z.fallbackDaysLabel).toBe("6 days");
    expect(z.tone).toBe("expiring");
    expect(m.rows.at(-1)!.id).toBe("z");
  });

  it("counts attention for Expired / Urgent / Expiring Soon rows that still have packs", () => {
    const m = buildDashboardViewModel(
      base({
        upcomingExpirations: [upcoming("a", 1, 4, 0), upcoming("b", 2, 3, 3), upcoming("m", 10, 4, 0), upcoming("c", 20, 4, 0)],
      }),
      NOW,
    );
    expect(m.attention).toBe(2); // "a" (urgent) and "m" (expiring soon); "b" is fully used, "c" is active
  });

  it("formats dates server-side as plain strings and handles a missing nearest expiration", () => {
    const m = buildDashboardViewModel(
      base({
        perPerson: [
          { id: "p1", fullName: "Maya", active: 1, issued: 0, nearestExpiration: inDays(19) },
          { id: "p2", fullName: "Dan", active: 0, issued: 2, nearestExpiration: null },
          { id: "p3", fullName: "Eli", active: 1, issued: 0, nearestExpiration: inDays(9) },
        ],
        recentActivity: [{ id: "n1", action: "Packs used", createdAt: new Date(Date.UTC(2026, 9, 12, 9, 55)), prescriptionTitle: "Rx", person: "Noa" }],
      }),
      NOW,
    );
    expect(m.perPerson.map((p) => p.nearestExpiration)).toEqual(["2026-11-01", null, "2026-10-22"]);
    expect(m.perPerson.map((p) => p.tone)).toEqual(["active", null, "expiring"]);
    expect(m.activity[0]).toMatchObject({ title: "Rx", person: "Noa", action: "Packs used", when: "2026-10-12 12:55" });
  });

  it("never reports negative remaining packs", () => {
    expect(remainingPacks({ totalPacks: 3, usedPacks: 5 })).toBe(0);
  });
});
