"use client";

import Link from "next/link";
import { useState } from "react";

import type { PrescriptionStatus } from "@/types/domain";

import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { StatusBadge } from "@/components/ui/status-badge";
import { useLocale } from "@/components/ui/locale-provider";
import { resolvePdfHref } from "@/utils/pdf-path";

type Row = {
  id: string;
  title: string;
  status: PrescriptionStatus;
  startDate: string;
  expirationDate: string;
  expirationDateValue: string;
  daysRemaining: string;
  pdfPath: string;
};

export function PrescriptionTable({
  rows,
  onMarkIssued,
  onUndoIssued,
  onDelete,
}: {
  rows: Row[];
  onMarkIssued: (id: string) => Promise<void>;
  onUndoIssued: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const [targetId, setTargetId] = useState<string | null>(null);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  function renderActions(row: Row, stacked = false) {
    return (
      <div className={stacked ? "grid gap-2 sm:flex sm:flex-wrap" : "flex flex-wrap gap-2"}>
        <Link
          href={resolvePdfHref(row.pdfPath)}
          target="_blank"
          className="rounded-lg border border-slate-300 px-2 py-2 text-center text-xs text-slate-700 sm:py-1"
        >
          {t.common.viewPdf}
        </Link>
        {row.status !== "issued" ? (
          <button
            type="button"
            onClick={() => setTargetId(row.id)}
            className="rounded-lg bg-slate-900 px-2 py-2 text-xs font-semibold text-white sm:py-1"
          >
            {t.common.markIssued}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onUndoIssued(row.id)}
            className="rounded-lg border border-slate-300 px-2 py-2 text-xs text-slate-700 sm:py-1"
          >
            {t.common.undoIssued}
          </button>
        )}
        <Link href={`/prescriptions/${row.id}`} className="rounded-lg border border-slate-300 px-2 py-2 text-center text-xs text-slate-700 sm:py-1">
          {t.common.actions}
        </Link>
        <button
          type="button"
          onClick={() => setTargetDeleteId(row.id)}
          className="rounded-lg border border-rose-300 px-2 py-2 text-xs text-rose-700 sm:py-1"
        >
          {t.common.delete}
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <div key={row.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-medium text-slate-900">{row.title}</p>
                <div className="mt-2">
                  <StatusBadge status={row.status} expirationDate={new Date(row.expirationDateValue)} />
                </div>
              </div>
            </div>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.prescriptions.table.startDate}</dt>
                <dd className="mt-1 text-slate-700">{row.startDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.prescriptions.table.expirationDate}</dt>
                <dd className="mt-1 text-slate-700">{row.expirationDate}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.prescriptions.table.daysRemaining}</dt>
                <dd className="mt-1 text-slate-700">{row.daysRemaining}</dd>
              </div>
            </dl>

            <div className="mt-4">{renderActions(row, true)}</div>
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-4 py-3">{t.prescriptions.table.title}</th>
              <th className="px-4 py-3">{t.prescriptions.table.status}</th>
              <th className="px-4 py-3">{t.prescriptions.table.startDate}</th>
              <th className="px-4 py-3">{t.prescriptions.table.expirationDate}</th>
              <th className="px-4 py-3">{t.prescriptions.table.daysRemaining}</th>
              <th className="px-4 py-3">{t.prescriptions.table.actions}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-slate-900">{row.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={row.status} expirationDate={new Date(row.expirationDateValue)} />
                </td>
                <td className="px-4 py-3 text-slate-600">{row.startDate}</td>
                <td className="px-4 py-3 text-slate-600">{row.expirationDate}</td>
                <td className="px-4 py-3 text-slate-600">{row.daysRemaining}</td>
                <td className="px-4 py-3">{renderActions(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationDialog
        open={Boolean(targetId)}
        title={t.common.markIssued}
        description={t.prescriptions.confirmIssue}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        onCancel={() => setTargetId(null)}
        onConfirm={async () => {
          if (targetId) {
            await onMarkIssued(targetId);
          }
          setTargetId(null);
        }}
      />

      <ConfirmationDialog
        open={Boolean(targetDeleteId)}
        title={t.common.delete}
        description={t.prescriptions.removeMonth}
        confirmLabel={t.common.confirm}
        cancelLabel={t.common.cancel}
        onCancel={() => setTargetDeleteId(null)}
        onConfirm={async () => {
          if (targetDeleteId) {
            await onDelete(targetDeleteId);
          }
          setTargetDeleteId(null);
        }}
      />
    </>
  );
}
