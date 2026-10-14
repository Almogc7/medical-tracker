"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { NavIcon } from "@/components/layout/nav-icons";
import { EXPIRING_SOON_MAX_DAYS } from "@/components/prescriptions/prescription-format";
import { PrescriptionList, type PrescriptionRowData } from "@/components/prescriptions/prescription-list";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { useLocale } from "@/components/ui/locale-provider";
import { cn } from "@/utils/cn";

const card = "rounded-[var(--radius-panel)] border border-border bg-surface";

/**
 * Person detail. Server actions (use packs / undo issued / delete) arrive as props from
 * app/people/[id]/page.tsx, so the view can be driven by mock handlers in the preview harness.
 */
export function PersonDetailView({
  person,
  rows,
  onUsePacks,
  onUndoIssued,
  onDelete,
}: {
  person: { id: string; name: string; note: string | null };
  rows: PrescriptionRowData[];
  onUsePacks: (id: string, packs: number) => Promise<void>;
  onUndoIssued: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return rows;
    // Same window as the Urgent + Expiring Soon badges (0-14 days).
    if (filter === "expiring_soon") return rows.filter((r) => r.status === "active" && r.daysRemainingValue >= 0 && r.daysRemainingValue <= EXPIRING_SOON_MAX_DAYS);
    return rows.filter((r) => r.status === filter);
  }, [filter, rows]);

  const tabs = [
    { value: "all", label: t.person.filterAll },
    { value: "active", label: t.person.filterActive },
    { value: "issued", label: t.person.filterIssued },
    { value: "expired", label: t.person.filterExpired },
    { value: "expiring_soon", label: t.person.filterExpiringSoon },
  ];

  const counts = {
    active: rows.filter((r) => r.status === "active").length,
    issued: rows.filter((r) => r.status === "issued").length,
    expired: rows.filter((r) => r.status === "expired").length,
  };

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/people" className="-ms-2 inline-flex min-h-11 touch-manipulation items-center gap-1 rounded-[var(--radius-component)] px-2 text-sm text-foreground-muted transition-colors hover:text-foreground">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="rtl:rotate-180">
          <path d="m15 6-6 6 6 6" />
        </svg>
        {t.person.backToPeople}
      </Link>

      <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl"><bdi>{person.name}</bdi></h1>
          <p className="mt-1 text-sm text-foreground-muted">{person.note ? <bdi>{person.note}</bdi> : t.person.prescriptions}</p>
        </div>
        <Link
          href="/upload"
          className="inline-flex h-12 w-full touch-manipulation items-center justify-center rounded-[var(--radius-component)] bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover active:scale-[0.98] sm:h-11 sm:w-auto"
        >
          {t.common.uploadPrescription}
        </Link>
      </div>

      <dl className="mt-5 grid max-w-md grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-border bg-border">
        {([
          [t.people.activeCount, counts.active, "text-status-healthy"],
          [t.people.issuedCount, counts.issued, "text-status-issued"],
          [t.status.expired, counts.expired, "text-status-danger"],
        ] as const).map(([label, value, color]) => (
          <div key={label} className="flex flex-col items-center justify-center bg-surface px-2 py-3 text-center">
            <dd className={cn("text-2xl font-semibold leading-none tabular-nums", value === 0 ? "text-foreground-subtle" : color)}>{value}</dd>
            <dt className="mt-1.5 text-xs leading-tight text-foreground-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <section aria-label={t.person.prescriptions} className="mt-6 space-y-3">
        {rows.length === 0 ? (
          <div className={card}><EmptyState icon={<NavIcon name="upload" />} title={t.person.noPrescriptions} message={t.person.noPrescriptionsMessage} /></div>
        ) : (
          <>
            <FilterTabs items={tabs} value={filter} onChange={setFilter} label={t.person.filterLabel} />
            {filtered.length === 0 ? (
              <div className={card}><EmptyState icon={<NavIcon name="dashboard" />} title={t.person.noMatches} message={t.person.prescriptions} /></div>
            ) : (
              <PrescriptionList rows={filtered} onUsePacks={onUsePacks} onUndoIssued={onUndoIssued} onDelete={onDelete} />
            )}
          </>
        )}
      </section>
    </div>
  );
}
