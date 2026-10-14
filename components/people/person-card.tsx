"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import type { PersonCardModel } from "@/components/people/people-model";
import { daysLabel, fill, remainingPacks, toneStyles } from "@/components/prescriptions/prescription-format";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/ui/locale-provider";
import { PackPips } from "@/components/ui/pack-pips";
import { StatusBadge } from "@/components/ui/status-badge";
import { useAsyncAction } from "@/components/ui/use-async-action";
import { isolate } from "@/utils/bidi";
import { cn } from "@/utils/cn";

const press = "touch-manipulation select-none active:scale-[0.98] active:brightness-95";

function Chevron() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-foreground-subtle rtl:rotate-180">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

/** Set the total packs of every prescription of this person. Two-step (open, then Apply) like the original. */
function SetPacksInline({ person, onSetAllPacks }: { person: PersonCardModel; onSetAllPacks: (personId: string, totalPacks: number) => Promise<void> }) {
  const { t } = useLocale();
  const inputId = useId();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [done, setDone] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const { run, pending, failed, clearFailed } = useAsyncAction();

  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setDone(false), 4000);
    return () => clearTimeout(id);
  }, [done]);

  if (person.prescriptionCount === 0) return null;

  // Never below what is already used on any prescription (same rule as editing a single prescription's total).
  const min = Math.max(1, person.maxUsedPacks);
  const parsed = parseInt(value, 10);
  const valid = !Number.isNaN(parsed) && parsed >= min;
  const error = value !== "" && !valid ? fill(t.prescriptions.totalPacksMin, { n: min }) : undefined;

  function close() {
    setOpen(false);
    setValue("");
    clearFailed();
  }

  // Applying overwrites the total of every prescription of this person, so it is confirmed first.
  function apply(e: React.FormEvent) {
    e.preventDefault();
    if (valid) setConfirming(true);
  }

  async function confirmApply() {
    setConfirming(false);
    if (await run(() => onSetAllPacks(person.id, parsed))) {
      close();
      setDone(true);
    }
  }

  const doneText = person.prescriptionCount === 1 ? t.people.setPacksDoneOne : fill(t.people.setPacksDoneMany, { n: person.prescriptionCount });

  if (!open) {
    return (
      <>
        <Button variant="secondary" size="sm" className={cn("flex-1", press)} onClick={() => { setDone(false); setOpen(true); }}>
          {t.people.setPacks}
        </Button>
        {done ? <p role="status" className="basis-full text-xs font-medium text-status-healthy">{doneText}</p> : null}
      </>
    );
  }

  return (
    <>
    <form onSubmit={apply} className="flex basis-full flex-wrap items-end gap-2">
      <div className="min-w-[8rem] flex-1">
        <Input id={inputId} label={t.people.setPacksLabel} type="number" min={min} inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} error={error} autoFocus disabled={pending} className="h-11" />
      </div>
      <Button type="submit" variant="primary" size="sm" className={press} disabled={!valid} loading={pending}>{t.people.setPacksApply}</Button>
      <Button type="button" variant="secondary" size="sm" className={press} disabled={pending} onClick={close}>{t.common.cancel}</Button>
      {failed ? <p role="alert" className="basis-full text-xs font-medium text-status-danger">{t.common.actionFailed}</p> : null}
    </form>
    <ConfirmationDialog
      open={confirming}
      title={t.people.setPacksConfirmTitle}
      description={fill(t.people.setPacksConfirmBody, { packs: parsed, n: person.prescriptionCount, name: isolate(person.name) })}
      confirmLabel={t.people.setPacksApply}
      cancelLabel={t.common.cancel}
      onCancel={() => setConfirming(false)}
      onConfirm={confirmApply}
    />
    </>
  );
}

export function PersonCard({ person, onSetAllPacks }: { person: PersonCardModel; onSetAllPacks: (personId: string, totalPacks: number) => Promise<void> }) {
  const { t } = useLocale();
  const nearest = person.nearest;
  const tone = nearest ? toneStyles[nearest.tone] : null;
  const href = `/people/${person.id}`;

  return (
    <li className={cn("flex flex-col gap-4 rounded-[var(--radius-panel)] border border-border border-s-4 bg-surface p-4", tone ? tone.stripe : "border-s-border")}>
      <Link href={href} className={cn("-m-1 flex min-h-11 items-start justify-between gap-3 rounded-[var(--radius-component)] p-1", press)}>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold leading-snug text-foreground"><bdi>{person.name}</bdi></h2>
          {person.note ? <p className="truncate text-xs text-foreground-muted"><bdi>{person.note}</bdi></p> : null}
        </div>
        <Chevron />
      </Link>

      {nearest && tone ? (
        <div>
          <p className="text-xs font-semibold text-foreground-muted">{t.people.nearestExpiration}</p>
          <div className="mt-1 flex items-start justify-between gap-3">
            <p className="min-w-0 text-sm font-medium leading-snug text-foreground" dir="auto">{nearest.title}</p>
            <StatusBadge status="active" daysLeft={nearest.daysLeft} />
          </div>
          <p className={cn("mt-1.5 flex items-center gap-1.5 text-sm font-medium tabular-nums", tone.text)}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", tone.dot)} />
            {daysLabel(t, nearest.daysLeft)}
          </p>
          <div className="mt-3"><PackPips total={nearest.totalPacks} used={nearest.usedPacks} tone={nearest.tone} /></div>
          <p className="mt-2 text-xs tabular-nums text-foreground-muted">
            {remainingPacks(nearest)} {t.dashboard.packsLeft} · {fill(t.dashboard.packsUsedOf, { used: nearest.usedPacks, total: nearest.totalPacks })} · {nearest.date}
          </p>
          {person.active > 1 ? <p className="mt-1 text-xs tabular-nums text-foreground-subtle">{fill(t.people.packsLeftTotal, { n: person.packsLeftActive })}</p> : null}
        </div>
      ) : (
        <p className="text-sm text-foreground-muted">{t.people.noActive}</p>
      )}

      <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-[var(--radius-component)] border border-border bg-border text-center">
        {([
          [t.people.activeCount, person.active, "text-status-healthy"],
          [t.people.issuedCount, person.issued, "text-status-issued"],
          [t.status.expired, person.expired, "text-status-danger"],
        ] as const).map(([label, value, color]) => (
          <div key={label} className="bg-surface px-1 py-2">
            <dd className={cn("text-xl font-semibold leading-none tabular-nums", value === 0 ? "text-foreground-subtle" : color)}>{value}</dd>
            <dt className="mt-1 text-xs leading-tight text-foreground-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-2">
        <Link href={href} className={cn("inline-flex h-11 flex-1 items-center justify-center rounded-[var(--radius-component)] bg-accent px-3 text-xs font-semibold text-accent-fg transition-colors hover:bg-accent-hover", press)}>
          {t.people.viewPrescriptions}
        </Link>
        <SetPacksInline person={person} onSetAllPacks={onSetAllPacks} />
      </div>
    </li>
  );
}
