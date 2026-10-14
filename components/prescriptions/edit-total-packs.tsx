"use client";

import { useId, useState } from "react";

import { fill } from "@/components/prescriptions/prescription-format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/ui/locale-provider";
import { useAsyncAction } from "@/components/ui/use-async-action";

/**
 * Edit a prescription's total packs. Controlled: `totalPacks` only changes after `onSave` resolves,
 * so the displayed number is never ahead of what the backend accepted.
 */
export function EditTotalPacks({
  totalPacks,
  usedPacks,
  onSave,
}: {
  totalPacks: number;
  usedPacks: number;
  onSave: (totalPacks: number) => Promise<void>;
}) {
  const { t } = useLocale();
  const inputId = useId();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(totalPacks));
  const { run, pending, failed, clearFailed } = useAsyncAction();

  const min = Math.max(1, usedPacks);
  const parsed = parseInt(value, 10);
  const valid = !Number.isNaN(parsed) && parsed >= min;
  const error = value !== "" && !valid ? fill(t.prescriptions.totalPacksMin, { n: min }) : undefined;

  async function save() {
    if (!valid) return;
    if (await run(() => onSave(parsed))) setEditing(false);
  }

  function cancel() {
    setEditing(false);
    clearFailed();
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground-muted">
          {t.prescriptions.totalPacks}: <strong className="tabular-nums text-foreground">{totalPacks}</strong>
        </p>
        <Button variant="secondary" size="sm" className="touch-manipulation" onClick={() => { setValue(String(totalPacks)); setEditing(true); }}>
          {t.common.edit}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[8rem] flex-1">
          <Input id={inputId} label={t.prescriptions.totalPacks} type="number" min={min} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} error={error} disabled={pending} autoFocus className="h-11" />
        </div>
        <div className="flex gap-2 pb-px">
          <Button variant="primary" size="sm" className="touch-manipulation" disabled={!valid} loading={pending} onClick={save}>{t.common.save}</Button>
          <Button variant="secondary" size="sm" className="touch-manipulation" disabled={pending} onClick={cancel}>{t.common.cancel}</Button>
        </div>
      </div>
      {failed ? <p role="alert" className="mt-2 text-xs font-medium text-status-danger">{t.common.actionFailed}</p> : null}
    </div>
  );
}
