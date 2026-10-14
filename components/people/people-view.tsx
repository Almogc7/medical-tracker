"use client";

import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { PersonCard } from "@/components/people/person-card";
import type { PersonCardModel } from "@/components/people/people-model";
import { fill } from "@/components/prescriptions/prescription-format";
import { NavIcon } from "@/components/layout/nav-icons";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/ui/locale-provider";
import { isolate } from "@/utils/bidi";
import { cn } from "@/utils/cn";

export type PeopleFeedback = { success?: "added" | "removed"; error?: string };

type FormAction = (formData: FormData) => void | Promise<void>;

const card = "rounded-[var(--radius-panel)] border border-border bg-surface";

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" className="w-full touch-manipulation" disabled={disabled} loading={pending}>
      {children}
    </Button>
  );
}

/**
 * People page. Server actions (add / remove / set all packs) arrive as props from app/people/page.tsx,
 * so this view never talks to the backend itself and can be driven by mock handlers in the preview harness.
 */
export function PeopleView({
  people,
  canAdd,
  max,
  feedback,
  addAction,
  removeAction,
  onSetAllPacks,
}: {
  people: PersonCardModel[];
  canAdd: boolean;
  max: number;
  feedback: PeopleFeedback;
  addAction: FormAction;
  removeAction: FormAction;
  onSetAllPacks: (personId: string, totalPacks: number) => Promise<void>;
}) {
  const { t } = useLocale();
  const [removeTarget, setRemoveTarget] = useState<PersonCardModel | null>(null);
  const removeFormRef = useRef<HTMLFormElement>(null);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t.people.title}</h1>
        <p className="rounded-full bg-border-subtle px-3 py-1 text-xs font-medium tabular-nums text-foreground-muted">
          {fill(t.people.slotsUsed, { n: people.length, max })}
        </p>
      </div>

      {feedback.success === "added" ? <Banner tone="success" className="mb-4">{t.people.addSuccess}</Banner> : null}
      {feedback.success === "removed" ? <Banner tone="success" className="mb-4">{t.people.removeSuccess}</Banner> : null}
      {feedback.error ? <Banner tone="error" className="mb-4">{feedback.error}</Banner> : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section aria-label={t.people.title}>
          {people.length ? (
            <ul className="grid gap-4 md:grid-cols-2">
              {people.map((person) => (
                <PersonCard key={person.id} person={person} onSetAllPacks={onSetAllPacks} />
              ))}
            </ul>
          ) : (
            <div className={card}><EmptyState icon={<NavIcon name="people" />} title={t.people.emptyTitle} message={t.people.emptyMessage} /></div>
          )}
        </section>

        <section aria-labelledby="manage" className={cn(card, "p-4 lg:sticky lg:top-20")}>
          <h2 id="manage" className="text-base font-semibold text-foreground">{t.people.manageTitle}</h2>
          <p className={cn("mt-1 text-sm", canAdd ? "text-foreground-muted" : "font-medium text-status-warning")}>
            {canAdd ? fill(t.people.slotsUsed, { n: people.length, max }) : t.people.maxReached}
          </p>

          <form action={addAction} className="mt-4 flex flex-col gap-3">
            <Input name="fullName" label={t.people.fullName} required disabled={!canAdd} autoComplete="off" className="h-11" />
            <Input name="note" label={t.people.optionalNote} disabled={!canAdd} autoComplete="off" className="h-11" />
            <SubmitButton disabled={!canAdd}>{t.people.addPerson}</SubmitButton>
          </form>

          {people.length ? (
            <ul className="mt-5 divide-y divide-border-subtle border-t border-border-subtle">
              {people.map((person) => (
                <li key={person.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="min-w-0 truncate text-sm text-foreground"><bdi>{person.name}</bdi></span>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="shrink-0 touch-manipulation"
                    aria-label={`${t.people.removePerson}: ${isolate(person.name)}`}
                    onClick={() => setRemoveTarget(person)}
                  >
                    {t.people.removePerson}
                  </Button>
                </li>
              ))}
            </ul>
          ) : null}
        </section>
      </div>

      {/* Hidden form: the real removePersonAction still runs, but only after the confirmation below. */}
      <form ref={removeFormRef} action={removeAction} className="hidden">
        <input type="hidden" name="personId" value={removeTarget?.id ?? ""} />
      </form>

      <ConfirmationDialog
        open={Boolean(removeTarget)}
        title={removeTarget ? fill(t.people.removeConfirmTitle, { name: isolate(removeTarget.name) }) : ""}
        description={removeTarget ? (removeTarget.prescriptionCount === 0 ? t.people.removeConfirmBodyNone : fill(t.people.removeConfirmBody, { n: removeTarget.prescriptionCount })) : ""}
        confirmLabel={t.people.removePerson}
        cancelLabel={t.common.cancel}
        variant="danger"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          removeFormRef.current?.requestSubmit();
          setRemoveTarget(null);
        }}
      />
    </div>
  );
}
