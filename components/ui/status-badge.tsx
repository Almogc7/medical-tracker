"use client";

import { badgeStyles, rowTone, toneLabel } from "@/components/prescriptions/prescription-format";
import { useLocale } from "@/components/ui/locale-provider";
import type { PrescriptionStatus } from "@/types/domain";
import { cn } from "@/utils/cn";

/**
 * Status pill with the shared urgency standard: Expired / Urgent (0-3 days) / Expiring Soon (4-14) / Active,
 * or Issued. `daysLeft` is calendar days until expiry (null when unknown).
 */
export function StatusBadge({ status, daysLeft }: { status: PrescriptionStatus; daysLeft: number | null }) {
  const { t } = useLocale();
  const tone = rowTone(status, daysLeft);
  const style = badgeStyles[tone];

  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium", style.pill)}>
      <span className={cn("h-1.5 w-1.5 flex-shrink-0 rounded-full", style.dot)} aria-hidden="true" />
      {toneLabel(t, tone)}
    </span>
  );
}
