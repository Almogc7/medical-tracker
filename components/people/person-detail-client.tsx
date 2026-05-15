"use client";

import { useMemo, useState, useTransition } from "react";

import type { PrescriptionStatus } from "@/types/domain";

import { deletePrescriptionAction, undoIssuedAction, usePacksAction } from "@/app/actions";
import { PrescriptionTable } from "@/components/prescriptions/prescription-table";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { useLocale } from "@/components/ui/locale-provider";

type PrescriptionRow = {
  id: string;
  title: string;
  status: PrescriptionStatus;
  startDate: string;
  expirationDate: string;
  expirationDateValue: string;
  daysRemainingValue: number;
  daysRemaining: string;
  pdfPath: string;
  totalPacks: number;
  usedPacks: number;
};

export function PersonDetailClient({ rows }: { rows: PrescriptionRow[] }) {
  const { t } = useLocale();
  const [filter, setFilter] = useState("all");
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "all") {
      return rows;
    }

    if (filter === "expiring_soon") {
      return rows.filter((row) => row.status === "active" && row.daysRemainingValue <= 30 && row.daysRemainingValue >= 0);
    }

    return rows.filter((row) => row.status === filter);
  }, [filter, rows]);

  const tabs = [
    { value: "all", label: t.person.filterAll },
    { value: "active", label: t.person.filterActive },
    { value: "issued", label: t.person.filterIssued },
    { value: "expired", label: t.person.filterExpired },
    { value: "expiring_soon", label: t.person.filterExpiringSoon },
  ];

  return (
    <div className="space-y-4">
      <FilterTabs items={tabs} value={filter} onChange={setFilter} />
      <PrescriptionTable
        rows={filtered}
        onUsePacks={async (id, packs) => {
          startTransition(async () => {
            await usePacksAction(id, packs);
          });
        }}
        onUndoIssued={async (id) => {
          startTransition(async () => {
            await undoIssuedAction(id);
          });
        }}
        onDelete={async (id) => {
          startTransition(async () => {
            await deletePrescriptionAction(id);
          });
        }}
      />
    </div>
  );
}
