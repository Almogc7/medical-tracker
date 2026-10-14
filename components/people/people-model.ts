import { remainingPacks, toneForDays, type Tone } from "@/components/prescriptions/prescription-format";
import type { PrescriptionStatus } from "@/types/domain";
import { formatDateInIsrael } from "@/utils/date";
import { daysUntilIsrael } from "@/utils/israel-time";

// Pure mapping from the data app/people/page.tsx already loads (people + their prescriptions)
// to what the People view renders. No Prisma, no I/O.

export type PeopleDataInput = {
  id: string;
  fullName: string;
  note: string | null;
  prescriptions: { id: string; title: string; status: PrescriptionStatus; expirationDate: Date; totalPacks: number; usedPacks: number }[];
}[];

export type PersonCardModel = {
  id: string;
  name: string;
  note: string | null;
  active: number;
  issued: number;
  expired: number;
  prescriptionCount: number;
  /** Active prescription closest to expiry, if any. */
  nearest: { id: string; title: string; date: string; daysLeft: number; totalPacks: number; usedPacks: number; tone: Tone } | null;
  /** Packs still available across all active prescriptions. */
  packsLeftActive: number;
  /** Most packs used on any one of this person's prescriptions (a bulk total below this would be nonsensical). */
  maxUsedPacks: number;
};

export function buildPeopleViewModel(people: PeopleDataInput, now = new Date()): PersonCardModel[] {
  return people.map((person) => {
    const active = person.prescriptions.filter((p) => p.status === "active");
    const nearest = [...active].sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())[0];
    const daysLeft = nearest ? daysUntilIsrael(nearest.expirationDate, now) : null;

    return {
      id: person.id,
      name: person.fullName,
      note: person.note?.trim() ? person.note : null,
      active: active.length,
      issued: person.prescriptions.filter((p) => p.status === "issued").length,
      expired: person.prescriptions.filter((p) => p.status === "expired").length,
      prescriptionCount: person.prescriptions.length,
      nearest:
        nearest && daysLeft !== null
          ? {
              id: nearest.id,
              title: nearest.title,
              date: formatDateInIsrael(nearest.expirationDate),
              daysLeft,
              totalPacks: nearest.totalPacks,
              usedPacks: nearest.usedPacks,
              tone: toneForDays(daysLeft),
            }
          : null,
      packsLeftActive: active.reduce((sum, p) => sum + remainingPacks(p), 0),
      maxUsedPacks: person.prescriptions.reduce((max, p) => Math.max(max, p.usedPacks), 0),
    };
  });
}
