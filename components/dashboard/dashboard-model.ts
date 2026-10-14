import { remainingPacks, toneForDays, type Tone } from "@/components/prescriptions/prescription-format";
import { formatDateInIsrael } from "@/utils/date";
import { daysUntilIsrael, formatDateTimeInIsrael } from "@/utils/israel-time";

export { remainingPacks, toneForDays };

// Pure mapping from the existing getDashboardData() result to what the dashboard view renders.
// No Prisma, no I/O: the same data flow as before, just reshaped for the redesigned UI.

export type DashboardTone = Tone;

export type DashboardDataInput = {
  summary: { active: number; expiringSoon: number; expired: number; issued: number };
  urgent: { id: string; title: string; person: string; daysRemaining: string; totalPacks: number; usedPacks: number }[];
  upcomingExpirations: {
    id: string;
    title: string;
    person: string;
    expirationDate: Date;
    daysRemaining: string;
    totalPacks: number;
    usedPacks: number;
  }[];
  perPerson: { id: string; fullName: string; active: number; issued: number; nearestExpiration: Date | null }[];
  recentActivity: { id: string; action: string; createdAt: Date; prescriptionTitle: string; person: string }[];
};

export type DashboardRx = {
  id: string;
  title: string;
  person: string;
  totalPacks: number;
  usedPacks: number;
  /** Calendar days until expiry. null when the item only appears in the urgent list (no date available). */
  daysLeft: number | null;
  /** Backend's English label, used only when daysLeft is null. */
  fallbackDaysLabel: string;
  tone: DashboardTone;
};

export type DashboardViewModel = {
  summary: DashboardDataInput["summary"];
  rows: DashboardRx[];
  heroId: string | null;
  attention: number;
  perPerson: { id: string; fullName: string; active: number; issued: number; nearestExpiration: string | null; tone: Tone | null }[];
  activity: { id: string; title: string; person: string; action: string; when: string }[];
};

export function buildDashboardViewModel(data: DashboardDataInput, now = new Date()): DashboardViewModel {
  const rows: DashboardRx[] = data.upcomingExpirations.map((item) => {
    const daysLeft = daysUntilIsrael(item.expirationDate, now);
    return {
      id: item.id,
      title: item.title,
      person: item.person,
      totalPacks: item.totalPacks,
      usedPacks: item.usedPacks,
      daysLeft,
      fallbackDaysLabel: item.daysRemaining,
      tone: toneForDays(daysLeft),
    };
  });

  // Urgent prescriptions beyond the 5-item "upcoming" window are still shown, with a fallback label.
  for (const item of data.urgent) {
    if (rows.some((r) => r.id === item.id)) continue;
    rows.push({
      id: item.id,
      title: item.title,
      person: item.person,
      totalPacks: item.totalPacks,
      usedPacks: item.usedPacks,
      daysLeft: null,
      fallbackDaysLabel: item.daysRemaining,
      tone: toneForDays(null),
    });
  }

  rows.sort((a, b) => (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity));

  const hero = rows.find((r) => remainingPacks(r) > 0) ?? rows[0] ?? null;

  return {
    summary: data.summary,
    rows,
    heroId: hero?.id ?? null,
    // Needs attention = Expired / Urgent / Expiring Soon (the shared urgency standard) with packs still to use.
    attention: rows.filter((r) => r.tone !== "active" && remainingPacks(r) > 0).length,
    perPerson: data.perPerson.map((p) => ({
      id: p.id,
      fullName: p.fullName,
      active: p.active,
      issued: p.issued,
      nearestExpiration: p.nearestExpiration ? formatDateInIsrael(p.nearestExpiration) : null,
      tone: p.nearestExpiration ? toneForDays(daysUntilIsrael(p.nearestExpiration, now)) : null,
    })),
    activity: data.recentActivity.map((a) => ({
      id: a.id,
      title: a.prescriptionTitle,
      person: a.person,
      action: a.action,
      when: formatDateTimeInIsrael(a.createdAt),
    })),
  };
}
