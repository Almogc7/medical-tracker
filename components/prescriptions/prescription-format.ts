import type { PrescriptionStatus } from "@/types/domain";
import type { TranslationDict } from "@/types/i18n";

// Pure presentation helpers shared by the dashboard, People and Prescription pages.
//
// Urgency standard (frontend only; backend statuses and business rules are unchanged):
//   Expired ......... red     "Expired"        (status "expired", or an active prescription already past its date)
//   0-3 days ........ red     "Urgent"
//   4-14 days ....... amber   "Expiring Soon"
//   more than 14 .... sage    "Active"
//   Issued .......... blue    "Issued"         (status "issued", independent of dates)

export const URGENT_MAX_DAYS = 3;
export const EXPIRING_SOON_MAX_DAYS = 14;

export type Tone = "expired" | "urgent" | "expiring" | "active";
export type RowTone = Tone | "issued";

export type ToneStyle = { dot: string; text: string; bar: string; stripe: string };

// Urgency is carried by a dot, text color and a calm inline-start stripe; never an alarm banner.
const danger: ToneStyle = { dot: "bg-status-danger", text: "text-status-danger", bar: "bg-status-danger", stripe: "border-s-status-danger" };

export const toneStyles: Record<RowTone, ToneStyle> = {
  expired: danger,
  urgent: danger,
  expiring: { dot: "bg-status-warning", text: "text-status-warning", bar: "bg-status-warning", stripe: "border-s-status-warning" },
  active: { dot: "bg-accent", text: "text-foreground-muted", bar: "bg-accent", stripe: "border-s-border" },
  issued: { dot: "bg-status-issued", text: "text-status-issued", bar: "bg-status-issued", stripe: "border-s-status-issued" },
};

/** Pill colors for the status badge, per tone. */
export const badgeStyles: Record<RowTone, { dot: string; pill: string }> = {
  expired: { dot: "bg-status-danger", pill: "bg-status-danger-bg text-status-danger" },
  urgent: { dot: "bg-status-danger", pill: "bg-status-danger-bg text-status-danger" },
  expiring: { dot: "bg-status-warning", pill: "bg-status-warning-bg text-status-warning" },
  active: { dot: "bg-accent", pill: "bg-accent-subtle text-accent" },
  issued: { dot: "bg-status-issued", pill: "bg-status-issued-bg text-status-issued" },
};

/** Tone for an ACTIVE prescription from calendar days until expiry. null (unknown) is treated as Expiring Soon. */
export function toneForDays(days: number | null): Tone {
  if (days === null) return "expiring"; // only known to be in the backend's urgent list (within 7 days)
  if (days < 0) return "expired";
  if (days <= URGENT_MAX_DAYS) return "urgent";
  if (days <= EXPIRING_SOON_MAX_DAYS) return "expiring";
  return "active";
}

/** Tone of any prescription row: expired/issued follow the status, active follows the days left. */
export function rowTone(status: PrescriptionStatus, daysLeft: number | null): RowTone {
  if (status === "expired") return "expired";
  if (status === "issued") return "issued";
  return toneForDays(daysLeft);
}

/** The one label used for a tone everywhere (badges, status lines). */
export function toneLabel(t: TranslationDict, tone: RowTone) {
  switch (tone) {
    case "expired":
      return t.status.expired;
    case "urgent":
      return t.status.urgent;
    case "expiring":
      return t.status.expiringSoon;
    case "issued":
      return t.status.issued;
    default:
      return t.status.active;
  }
}

export const remainingPacks = (rx: { totalPacks: number; usedPacks: number }) => Math.max(0, rx.totalPacks - rx.usedPacks);

export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k]));

/** Localized "N days left" / "Expires today" / "Expired N days ago". `fallback` is used when no numeric days exist. */
export function daysLabel(t: TranslationDict, days: number | null, fallback = "") {
  if (days === null) return fallback;
  if (days < 0) return days === -1 ? t.dashboard.daysAgoOne : fill(t.dashboard.daysAgoMany, { n: -days });
  if (days === 0) return t.dashboard.daysLeftToday;
  if (days === 1) return t.dashboard.daysLeftOne;
  return fill(t.dashboard.daysLeftMany, { n: days });
}
