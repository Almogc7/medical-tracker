"use client";

import Link from "next/link";
import { useId, useState } from "react";

import { daysLabel, fill, remainingPacks, rowTone, toneStyles } from "@/components/prescriptions/prescription-format";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/ui/locale-provider";
import { PackPips } from "@/components/ui/pack-pips";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAsyncAction } from "@/components/ui/use-async-action";
import type { PrescriptionStatus } from "@/types/domain";
import { isolate } from "@/utils/bidi";
import { cn } from "@/utils/cn";
import { resolvePdfHref } from "@/utils/pdf-path";

export type PrescriptionRowData = {
  id: string;
  title: string;
  status: PrescriptionStatus;
  startDate: string;
  expirationDate: string;
  expirationDateValue: string;
  daysRemainingValue: number;
  pdfPath: string;
  totalPacks: number;
  usedPacks: number;
};

const press = "touch-manipulation select-none active:scale-[0.98] active:brightness-95";
const linkButton = cn("inline-flex h-11 items-center justify-center rounded-[var(--radius-component)] border border-border bg-surface px-3 text-xs font-semibold text-foreground transition-colors hover:bg-border-subtle", press);

// ── Use packs: same validation and wording as before, now with honest pending/failed state ──────────────
function UsePacksDialog({
  open,
  remaining,
  prescriptionTitle,
  pending,
  failed,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  remaining: number;
  prescriptionTitle: string;
  pending: boolean;
  failed: boolean;
  onConfirm: (packs: number) => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const inputId = useId();
  const [value, setValue] = useState("1");

  const parsed = parseInt(value, 10);
  const valid = !Number.isNaN(parsed) && parsed >= 1 && parsed <= remaining;
  const error = value !== "" && !valid ? t.prescriptions.usePacksInvalid : undefined;

  function cancel() {
    onCancel();
    setValue("1");
  }

  return (
    <Dialog open={open} onClose={cancel} title={t.prescriptions.usePacksTitle} description={`${prescriptionTitle} · ${remaining} ${t.prescriptions.packsRemaining}`} maxWidth="sm">
      <div className="space-y-4">
        <Input id={inputId} label={t.prescriptions.usePacksDescription} type="number" min={1} max={remaining} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} error={error} disabled={pending} autoFocus className="h-11" />
        {failed ? <p role="alert" className="text-sm font-medium text-status-danger">{t.common.actionFailed}</p> : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={cancel} disabled={pending}>{t.common.cancel}</Button>
          <Button
            variant="primary"
            disabled={!valid}
            loading={pending}
            onClick={() => {
              if (valid) {
                onConfirm(parsed);
                setValue("1");
              }
            }}
          >
            {t.common.confirm}
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

// ── One prescription ─────────────────────────────────────────────────────────────────────────────────
function PrescriptionItem({
  row,
  busy,
  onUsePacks,
  onUndoIssued,
  onDelete,
}: {
  row: PrescriptionRowData;
  busy: boolean;
  onUsePacks: () => void;
  onUndoIssued: () => void;
  onDelete: () => void;
}) {
  const { t } = useLocale();
  const remaining = remainingPacks(row);
  const tone = rowTone(row.status, row.daysRemainingValue);
  const k = toneStyles[tone];
  const showDays = row.status !== "issued";

  return (
    <li className={cn("rounded-[var(--radius-panel)] border border-border border-s-4 bg-surface p-4 md:grid md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_auto] md:items-center md:gap-6", k.stripe)}>
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-base font-medium leading-snug text-foreground" dir="auto">{row.title}</p>
          <div className="shrink-0"><StatusBadge status={row.status} daysLeft={row.daysRemainingValue} /></div>
        </div>
        <p className="mt-1 text-xs tabular-nums text-foreground-muted">
          <span className="sr-only">{t.common.startsOn}: </span>
          <span dir="ltr">{row.startDate}</span>
          <span aria-hidden="true"> – </span>
          <span className="sr-only">{t.common.expiresOn}: </span>
          <span dir="ltr">{row.expirationDate}</span>
        </p>
        {showDays ? (
          <p className={cn("mt-2 flex items-center gap-1.5 text-sm font-medium tabular-nums", k.text)}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", k.dot)} />
            {daysLabel(t, row.daysRemainingValue)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 md:mt-0">
        <PackPips total={row.totalPacks} used={row.usedPacks} tone={tone} />
        <p className="mt-2 text-xs tabular-nums text-foreground-muted">
          {row.status === "issued" || remaining === 0 ? fill(t.dashboard.packsUsedOf, { used: row.usedPacks, total: row.totalPacks }) : `${remaining} ${t.dashboard.packsLeft} · ${fill(t.dashboard.packsUsedOf, { used: row.usedPacks, total: row.totalPacks })}`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 md:mt-0 md:flex md:flex-wrap md:justify-end">
        {row.status !== "issued" && remaining > 0 ? (
          <Button variant="primary" size="sm" className={cn("col-span-3 md:col-auto", press)} disabled={busy} aria-label={`${t.common.usePacks}: ${isolate(row.title)}`} onClick={onUsePacks}>
            {t.common.usePacks}
          </Button>
        ) : row.status === "issued" ? (
          <Button variant="secondary" size="sm" className={cn("col-span-3 md:col-auto", press)} disabled={busy} aria-label={`${t.common.undoIssued}: ${isolate(row.title)}`} onClick={onUndoIssued}>
            {t.common.undoIssued}
          </Button>
        ) : null}

        <Link href={resolvePdfHref(row.pdfPath)} target="_blank" rel="noopener noreferrer" aria-label={`${t.common.viewPdf}: ${isolate(row.title)}`} className={linkButton}>
          {t.common.viewPdf}
        </Link>
        <Link href={`/prescriptions/${row.id}`} aria-label={`${t.common.details}: ${isolate(row.title)}`} className={linkButton}>
          {t.common.details}
        </Link>
        <Button variant="danger" size="sm" className={press} disabled={busy} aria-label={`${t.common.delete}: ${isolate(row.title)}`} onClick={onDelete}>
          {t.common.delete}
        </Button>
      </div>
    </li>
  );
}

// ── List ─────────────────────────────────────────────────────────────────────────────────────────────
export function PrescriptionList({
  rows,
  onUsePacks,
  onUndoIssued,
  onDelete,
}: {
  rows: PrescriptionRowData[];
  onUsePacks: (id: string, packs: number) => Promise<void>;
  onUndoIssued: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const { t } = useLocale();
  const [packTargetId, setPackTargetId] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [undoTargetId, setUndoTargetId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [packsUpdated, setPacksUpdated] = useState(false);
  const { run, pending, failed, clearFailed } = useAsyncAction();

  const packTarget = rows.find((r) => r.id === packTargetId) ?? null;
  const deleteTarget = rows.find((r) => r.id === deleteTargetId) ?? null;
  const remaining = packTarget ? remainingPacks(packTarget) : 0;

  async function runFor(id: string, action: () => Promise<void>) {
    setBusyId(id);
    setPacksUpdated(false);
    const ok = await run(action);
    setBusyId(null);
    return ok;
  }

  return (
    <>
      {failed && !packTargetId ? <Banner tone="error" className="mb-3">{t.common.actionFailed}</Banner> : null}
      {packsUpdated ? <Banner tone="success" className="mb-3">{t.common.packsUpdated}</Banner> : null}

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <PrescriptionItem
            key={row.id}
            row={row}
            busy={pending && busyId === row.id}
            onUsePacks={() => { clearFailed(); setPackTargetId(row.id); }}
            onUndoIssued={() => { clearFailed(); setUndoTargetId(row.id); }}
            onDelete={() => { clearFailed(); setDeleteTargetId(row.id); }}
          />
        ))}
      </ul>

      <UsePacksDialog
        open={Boolean(packTarget) && remaining > 0}
        remaining={remaining}
        prescriptionTitle={packTarget?.title ?? ""}
        pending={pending}
        failed={failed && Boolean(packTargetId)}
        onConfirm={async (packs) => {
          if (!packTargetId) return;
          if (await runFor(packTargetId, () => onUsePacks(packTargetId, packs))) {
            setPackTargetId(null);
            setPacksUpdated(true);
          }
        }}
        onCancel={() => { clearFailed(); setPackTargetId(null); }}
      />

      <ConfirmationDialog
        open={Boolean(undoTargetId)}
        title={t.prescriptions.undoIssuedConfirmTitle}
        description={t.prescriptions.undoIssuedConfirmBody}
        confirmLabel={t.common.undoIssued}
        cancelLabel={t.common.cancel}
        variant="danger"
        onCancel={() => setUndoTargetId(null)}
        onConfirm={() => {
          const id = undoTargetId;
          setUndoTargetId(null);
          if (id) void runFor(id, () => onUndoIssued(id));
        }}
      />

      <ConfirmationDialog
        open={Boolean(deleteTargetId)}
        title={t.prescriptions.deleteConfirmTitle}
        description={deleteTarget ? fill(t.prescriptions.deleteConfirmBody, { title: isolate(deleteTarget.title) }) : ""}
        confirmLabel={t.common.delete}
        cancelLabel={t.common.cancel}
        variant="danger"
        onCancel={() => setDeleteTargetId(null)}
        onConfirm={() => {
          const id = deleteTargetId;
          setDeleteTargetId(null);
          if (id) void runFor(id, () => onDelete(id));
        }}
      />
    </>
  );
}
