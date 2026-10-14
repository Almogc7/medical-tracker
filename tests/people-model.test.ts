import { describe, expect, it } from "vitest";

import { buildPeopleViewModel, type PeopleDataInput } from "@/components/people/people-model";
import { daysLabel, fill, remainingPacks, rowTone, toneForDays, toneLabel, toneStyles } from "@/components/prescriptions/prescription-format";
import { en } from "@/locales/en";
import { he } from "@/locales/he";

// Explicit UTC instants (09:00Z = 12:00 in Israel), so results do not depend on the machine timezone.
const NOW = new Date(Date.UTC(2026, 9, 13, 9, 0, 0));
const inDays = (n: number) => new Date(Date.UTC(2026, 9, 13 + n, 9, 0, 0));

const rx = (id: string, status: "active" | "issued" | "expired", days: number, total: number, used: number) => ({
  id,
  title: `Rx ${id}`,
  status,
  expirationDate: inDays(days),
  totalPacks: total,
  usedPacks: used,
});

const person = (id: string, prescriptions: ReturnType<typeof rx>[], note: string | null = null) => ({ id, fullName: `P ${id}`, note, prescriptions });

describe("buildPeopleViewModel", () => {
  it("counts statuses and picks the nearest ACTIVE prescription", () => {
    const [m] = buildPeopleViewModel([person("1", [rx("late", "active", 30, 6, 0), rx("soon", "active", 2, 6, 2), rx("old", "issued", -20, 6, 6), rx("gone", "expired", -50, 6, 3)])], NOW);
    expect([m.active, m.issued, m.expired, m.prescriptionCount]).toEqual([2, 1, 1, 4]);
    expect(m.nearest).toMatchObject({ id: "soon", daysLeft: 2, tone: "urgent", totalPacks: 6, usedPacks: 2, date: "2026-10-15" });
  });

  it("sums packs left over active prescriptions only", () => {
    const [m] = buildPeopleViewModel([person("1", [rx("a", "active", 5, 6, 2), rx("b", "active", 20, 4, 0), rx("c", "issued", -5, 6, 6), rx("d", "expired", -9, 6, 1)])], NOW);
    expect(m.packsLeftActive).toBe(4 + 4);
  });

  it("reports the highest usage on any prescription so a bulk total can never go below it", () => {
    const [m] = buildPeopleViewModel([person("1", [rx("a", "active", 5, 6, 2), rx("b", "issued", -5, 6, 6), rx("c", "expired", -9, 6, 3)])], NOW);
    expect(m.maxUsedPacks).toBe(6);
    expect(buildPeopleViewModel([person("2", [])], NOW)[0].maxUsedPacks).toBe(0);
  });

  it("handles a person with no active prescriptions", () => {
    const [m] = buildPeopleViewModel([person("1", [rx("c", "issued", -5, 6, 6)])], NOW);
    expect(m.nearest).toBeNull();
    expect(m.packsLeftActive).toBe(0);
  });

  it("handles a person with no prescriptions and normalizes blank notes", () => {
    const people: PeopleDataInput = [person("1", [], "   "), person("2", [], "Hello")];
    const [a, b] = buildPeopleViewModel(people, NOW);
    expect([a.prescriptionCount, a.note]).toEqual([0, null]);
    expect(b.note).toBe("Hello");
  });

  it("assigns the shared urgency tone to the nearest active prescription", () => {
    const tones = buildPeopleViewModel(
      [person("1", [rx("a", "active", 3, 4, 0)]), person("2", [rx("b", "active", 4, 4, 0)]), person("3", [rx("c", "active", 14, 4, 0)]), person("4", [rx("d", "active", 15, 4, 0)])],
      NOW,
    ).map((p) => p.nearest?.tone);
    expect(tones).toEqual(["urgent", "expiring", "expiring", "active"]);
  });

  it("keeps the order it is given", () => {
    const m = buildPeopleViewModel([person("z", []), person("a", [])], NOW);
    expect(m.map((p) => p.id)).toEqual(["z", "a"]);
  });
});

describe("prescription-format", () => {
  it("rowTone follows the shared standard: Expired / Urgent 0-3 / Expiring Soon 4-14 / Active >14, plus Issued", () => {
    expect(rowTone("expired", -40)).toBe("expired");
    expect(rowTone("issued", -40)).toBe("issued");
    expect(rowTone("issued", 2)).toBe("issued");
    expect(rowTone("active", -1)).toBe("expired"); // active but already past its date
    expect(rowTone("active", 0)).toBe("urgent");
    expect(rowTone("active", 3)).toBe("urgent");
    expect(rowTone("active", 4)).toBe("expiring");
    expect(rowTone("active", 14)).toBe("expiring");
    expect(rowTone("active", 15)).toBe("active");
    expect(toneForDays(null)).toBe("expiring");
  });

  it("toneLabel uses the same words everywhere, in both languages", () => {
    const tones = ["expired", "urgent", "expiring", "active", "issued"] as const;
    expect(tones.map((x) => toneLabel(en, x))).toEqual(["Expired", "Urgent", "Expiring Soon", "Active", "Issued"]);
    expect(tones.map((x) => toneLabel(he, x))).toEqual(["פג תוקף", "דחוף", "פג בקרוב", "פעיל", "מומש"]);
  });

  it("red tones are shared by Expired and Urgent; Expiring Soon is amber; Active is neutral/sage", () => {
    expect(toneStyles.expired).toEqual(toneStyles.urgent);
    expect(toneStyles.urgent.text).toBe("text-status-danger");
    expect(toneStyles.expiring.text).toBe("text-status-warning");
    expect(toneStyles.active.bar).toBe("bg-accent");
  });

  it("daysLabel localizes singular, plural, today and past in both languages", () => {
    expect([5, 1, 0, -1, -9].map((d) => daysLabel(en, d))).toEqual(["5 days left", "1 day left", "Expires today", "Expired yesterday", "Expired 9 days ago"]);
    expect([5, 1, 0, -1, -9].map((d) => daysLabel(he, d))).toEqual(["נותרו 5 ימים", "נותר יום אחד", "פג היום", "פג אתמול", "פג לפני 9 ימים"]);
    expect(daysLabel(en, null, "6 days")).toBe("6 days");
  });

  it("fill replaces placeholders and remainingPacks never goes negative", () => {
    expect(fill("{used} of {total} used", { used: 2, total: 6 })).toBe("2 of 6 used");
    expect(remainingPacks({ totalPacks: 3, usedPacks: 9 })).toBe(0);
  });

  it("every new translation key exists and has matching placeholders in English and Hebrew", () => {
    const pairs: [string, string][] = [
      [en.people.slotsUsed, he.people.slotsUsed],
      [en.people.removeConfirmTitle, he.people.removeConfirmTitle],
      [en.people.setPacksDoneMany, he.people.setPacksDoneMany],
      [en.people.packsLeftTotal, he.people.packsLeftTotal],
      [en.prescriptions.totalPacksMin, he.prescriptions.totalPacksMin],
      [en.dashboard.packsUsedOf, he.dashboard.packsUsedOf],
    ];
    for (const [a, b] of pairs) {
      expect(a.match(/\{\w+\}/g)?.sort()).toEqual(b.match(/\{\w+\}/g)?.sort());
    }
  });
});
