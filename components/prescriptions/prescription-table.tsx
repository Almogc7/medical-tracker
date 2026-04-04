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

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={resolvePdfHref(row.pdfPath)}
                      target="_blank"
                      className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700"
                    >
                      {t.common.viewPdf}
                    </Link>
                    {row.status !== "issued" ? (
                      <button
                        type="button"
                        onClick={() => setTargetId(row.id)}
                        className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white"
                      >
                        {t.common.markIssued}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onUndoIssued(row.id)}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700"
                      >
                        {t.common.undoIssued}
                      </button>
                    )}
                    <Link href={`/prescriptions/${row.id}`} className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-700">
                      {t.common.actions}
                    </Link>
                    <button
                      type="button"
                      onClick={() => setTargetDeleteId(row.id)}
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs text-rose-700"
                    >
                      {t.common.delete}
                    </button>
                  </div>
                </td>
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
