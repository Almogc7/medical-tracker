import { ISRAEL_TIME_ZONE } from "@/utils/date";

// Display-side date helpers. Everything the UI shows (times, day grouping, "days left") is computed in
// Asia/Jerusalem, regardless of the server's own timezone (Vercel runs in UTC).
// Prescription dates are stored at UTC noon of the Israeli calendar date, so they map back to the same date here.
// These helpers are for presentation only; backend rules (statuses, reminder thresholds) keep their own logic.

const partsFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: ISRAEL_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

/** Calendar date (yyyy-MM-dd) and clock time (HH:mm) of an instant in Israel time. */
export function israelParts(date: Date) {
  const p = Object.fromEntries(partsFormatter.formatToParts(date).map((x) => [x.type, x.value]));
  return { day: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
}

/** "yyyy-MM-dd HH:mm" in Israel time. */
export function formatDateTimeInIsrael(date: Date) {
  const { day, time } = israelParts(date);
  return `${day} ${time}`;
}

/** Whole days since the epoch for a yyyy-MM-dd calendar date (timezone free, so differences are exact). */
export function dayNumber(isoDay: string) {
  const [y, m, d] = isoDay.split("-").map(Number);
  return Date.UTC(y, m - 1, d) / 86_400_000;
}

/** Calendar days from today (in Israel) until `target`'s Israeli date. Negative once the date has passed. */
export function daysUntilIsrael(target: Date, now = new Date()) {
  return dayNumber(israelParts(target).day) - dayNumber(israelParts(now).day);
}
