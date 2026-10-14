"use client";

import Link from "next/link";
import { useState } from "react";

import { EditTotalPacks } from "@/components/prescriptions/edit-total-packs";
import { daysLabel, fill, remainingPacks, rowTone, toneStyles } from "@/components/prescriptions/prescription-format";
import { useLocale } from "@/components/ui/locale-provider";
import { PackPips } from "@/components/ui/pack-pips";
import { StatusBadge } from "@/components/ui/status-badge";
import type { PrescriptionStatus } from "@/types/domain";
import { cn } from "@/utils/cn";
import { resolvePdfHref } from "@/utils/pdf-path";

export type PrescriptionDetailData = {
  id: string;
  title: string;
  status: PrescriptionStatus;
  personId: string;
  personName: string;
  startDate: string;
  expirationDate: string;
  expirationDateValue: string;
  daysRemainingValue: number;
  totalPacks: number;
  usedPacks: number;
  notes: string | null;
  pdfPath: string;
};

/**
 * Prescription detail. Only editable thing is the total packs; `onSaveTotalPacks` is the real
 * updateTotalPacksAction passed from the page (or a mock handler in the preview harness).
 */
export function PrescriptionDetailView({
  prescription: rx,
  onSaveTotalPacks,
}: {
  prescription: PrescriptionDetailData;
  onSaveTotalPacks: (id: string, totalPacks: number) => Promise<void>;
}) {
  const { t } = useLocale();
  // The page is not revalidated by updateTotalPacksAction, so keep the last value the backend accepted.
  const [totalPacks, setTotalPacks] = useState(rx.totalPacks);

  const tone = rowTone(rx.status, rx.daysRemainingValue);
  const k = toneStyles[tone];
  const remaining = remainingPacks({ totalPacks, usedPacks: rx.usedPacks });

  return (
    <div className="mx-auto max-w-3xl">
      <Link href={`/people/${rx.personId}`} className="-ms-2 inline-flex min-h-11 touch-manipulation items-center gap-1 rounded-[var(--radius-component)] px-2 text-sm text-foreground-muted transition-colors hover:text-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
          <path d="m15 6-6 6 6 6" />
        </svg>
        {t.common.back}
        <span aria-hidden="true">·</span>
        <bdi>{rx.personName}</bdi>
      </Link>

      <article className={cn("mt-1 space-y-6 rounded-[var(--radius-panel)] border border-border border-s-4 bg-surface p-5 md:p-6", k.stripe)}>
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-foreground-muted">{t.prescriptions.detail}</p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight tracking-tight text-foreground" dir="auto">{rx.title}</h1>
            <p className="mt-1 text-sm text-foreground-muted"><bdi>{rx.personName}</bdi></p>
          </div>
          <StatusBadge status={rx.status} daysLeft={rx.daysRemainingValue} />
        </header>

        <section aria-label={t.prescriptions.totalPacks}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="flex items-baseline gap-2">
              <span className="text-5xl font-semibold leading-none tabular-nums text-foreground">{remaining}</span>
              <span className="text-sm font-medium text-foreground-muted">{t.dashboard.packsLeft}</span>
            </p>
            <p className="text-xs tabular-nums text-foreground-muted">{fill(t.dashboard.packsUsedOf, { used: rx.usedPacks, total: totalPacks })}</p>
          </div>
          <div className="mt-4"><PackPips size="lg" total={totalPacks} used={rx.usedPacks} tone={tone} /></div>
          <div className="mt-4 border-t border-border-subtle pt-4">
            <EditTotalPacks totalPacks={totalPacks} usedPacks={rx.usedPacks} onSave={async (n) => { await onSaveTotalPacks(rx.id, n); setTotalPacks(n); }} />
          </div>
        </section>

        <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-component)] border border-border bg-border sm:grid-cols-3">
          <div className="bg-surface p-3">
            <dt className="text-xs font-semibold text-foreground-muted">{t.common.startsOn}</dt>
            <dd className="mt-1 text-sm tabular-nums text-foreground"><span dir="ltr">{rx.startDate}</span></dd>
          </div>
          <div className="bg-surface p-3">
            <dt className="text-xs font-semibold text-foreground-muted">{t.common.expiresOn}</dt>
            <dd className="mt-1 text-sm tabular-nums text-foreground"><span dir="ltr">{rx.expirationDate}</span></dd>
          </div>
          <div className="bg-surface p-3">
            <dt className="text-xs font-semibold text-foreground-muted">{t.common.daysRemaining}</dt>
            <dd className={cn("mt-1 flex items-center gap-1.5 text-sm font-medium tabular-nums", rx.status === "issued" ? "text-foreground" : k.text)}>
              {rx.status !== "issued" ? <span aria-hidden="true" className={cn("size-2 rounded-full", k.dot)} /> : null}
              {daysLabel(t, rx.daysRemainingValue)}
            </dd>
          </div>
        </dl>

        <div>
          <p className="text-xs font-semibold text-foreground-muted">{t.common.notes}</p>
          <p className="mt-1 whitespace-pre-line text-sm text-foreground" dir="auto">{rx.notes || "-"}</p>
        </div>

        <Link
          href={resolvePdfHref(rx.pdfPath)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 w-full touch-manipulation items-center justify-center rounded-[var(--radius-component)] border border-border bg-surface px-4 text-sm font-semibold text-foreground transition-colors hover:bg-border-subtle active:scale-[0.98] sm:w-auto"
        >
          {t.common.viewPdf}
        </Link>
      </article>
    </div>
  );
}
