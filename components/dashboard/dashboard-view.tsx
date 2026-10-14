"use client";

import { useEffect, useState, useTransition } from "react";

import type { DashboardRx, DashboardViewModel } from "@/components/dashboard/dashboard-model";
import { daysLabel, fill, remainingPacks, toneLabel, toneStyles } from "@/components/prescriptions/prescription-format";
import { NavIcon } from "@/components/layout/nav-icons";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { useLocale } from "@/components/ui/locale-provider";
import { PackPips } from "@/components/ui/pack-pips";
import { StatusBadge } from "@/components/ui/status-badge";
import { isolate } from "@/utils/bidi";
import { cn } from "@/utils/cn";

const press = "touch-manipulation select-none active:scale-[0.98] active:brightness-95";
const card = "rounded-[var(--radius-panel)] border border-border bg-surface";

function SectionLabel({ id, children, count }: { id?: string; children: React.ReactNode; count?: number }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-foreground-muted rtl:tracking-normal">
      {children}
      {count !== undefined && (
        <span className="rounded-full bg-border-subtle px-2 py-0.5 text-xs font-medium tabular-nums tracking-normal text-foreground-muted">{count}</span>
      )}
    </h2>
  );
}

function StatusLine({ rx }: { rx: DashboardRx }) {
  const { t } = useLocale();
  const k = toneStyles[rx.tone];
  return (
    <p className={cn("flex flex-wrap items-center gap-x-2 text-sm font-medium", k.text)}>
      <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-full", k.dot)} />
      <span>{toneLabel(t, rx.tone)}</span>
      <span aria-hidden="true" className="text-foreground-subtle">·</span>
      <span className="tabular-nums">{daysLabel(t, rx.daysLeft, rx.fallbackDaysLabel)}</span>
    </p>
  );
}

/**
 * Two-step pack usage (open, then Confirm/Cancel), same as the original flow. Pack use cannot be undone
 * by the backend, so there is no one-tap path. Nothing is shown as saved until `onUse` resolves.
 */
function PackUsage({ rx, onUse, large = false }: { rx: DashboardRx; onUse: (id: string, packs: number) => Promise<void>; large?: boolean }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [n, setN] = useState(1);
  const [failed, setFailed] = useState(false);
  const [updated, setUpdated] = useState(false);
  const [pending, startTransition] = useTransition();

  const remaining = remainingPacks(rx);
  const count = Math.min(Math.max(n, 1), Math.max(remaining, 1));

  useEffect(() => {
    if (!updated) return;
    const id = setTimeout(() => setUpdated(false), 3000);
    return () => clearTimeout(id);
  }, [updated]);

  function close() {
    setOpen(false);
    setN(1);
    setFailed(false);
  }

  function confirm() {
    setFailed(false);
    startTransition(async () => {
      try {
        await onUse(rx.id, count);
        close();
        setUpdated(true);
      } catch {
        setFailed(true);
      }
    });
  }

  const live = (
    <p role={failed ? "alert" : "status"} className={cn("text-xs", failed ? "mt-2 font-medium text-status-danger" : updated ? "mt-2 text-status-healthy" : "sr-only")}>
      {failed ? t.common.actionFailed : updated ? t.common.packsUpdated : ""}
    </p>
  );

  if (remaining <= 0) return null;

  if (!open) {
    return (
      <div>
        <Button
          variant={large ? "primary" : "secondary"}
          size={large ? "md" : "sm"}
          className={cn(press, large ? "w-full" : "border-accent text-accent hover:bg-accent-subtle")}
          aria-label={`${t.common.usePacks}: ${isolate(rx.person)}, ${isolate(rx.title)}`}
          onClick={() => setOpen(true)}
        >
          {t.common.usePacks}
        </Button>
        {live}
      </div>
    );
  }

  const stepBtn = cn(
    "inline-flex size-11 items-center justify-center rounded-[var(--radius-component)] border border-border bg-surface text-xl text-foreground transition-colors hover:bg-border-subtle disabled:opacity-40",
    press,
  );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Numeric stepper keeps −/+ in math order in both directions. */}
        <div dir="ltr" className="flex items-center" role="group" aria-label={t.prescriptions.usePacksDescription}>
          <button type="button" className={stepBtn} aria-label={t.dashboard.decreasePacks} disabled={pending || count <= 1} onClick={() => setN(count - 1)}>−</button>
          <span className="w-10 text-center text-xl font-semibold tabular-nums" aria-live="polite">{count}</span>
          <button type="button" className={stepBtn} aria-label={t.dashboard.increasePacks} disabled={pending || count >= remaining} onClick={() => setN(count + 1)}>+</button>
        </div>
        <span className="text-xs text-foreground-muted" aria-hidden="true">/ {remaining}</span>
        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" className={press} loading={pending} onClick={confirm}>{t.common.confirm}</Button>
          <Button variant="secondary" size="sm" className={press} disabled={pending} onClick={close}>{t.common.cancel}</Button>
        </div>
      </div>
      {live}
    </div>
  );
}

export function DashboardView({ model, onUsePacks }: { model: DashboardViewModel; onUsePacks: (id: string, packs: number) => Promise<void> }) {
  const { t } = useLocale();
  const [filter, setFilter] = useState("all");

  const hero = model.rows.find((r) => r.id === model.heroId) ?? null;
  const people = Array.from(new Set(model.rows.map((r) => r.person)));
  const activeFilter = people.includes(filter) ? filter : "all";
  const visible = model.rows.filter((r) => activeFilter === "all" || r.person === activeFilter);

  const attention =
    model.attention === 0 ? t.dashboard.attentionNone : model.attention === 1 ? t.dashboard.attentionOne : fill(t.dashboard.attentionMany, { n: model.attention });

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t.dashboard.title}</h1>
        <p className="mt-1 text-sm text-foreground-muted">{attention}</p>
      </div>

      {/* One grid, placed explicitly on desktop; DOM order is the mobile reading order. */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.75fr)_minmax(0,1fr)] lg:gap-6">
        {/* Hero: the next prescription to expire that still has packs */}
        {hero ? (
          <section aria-labelledby="next-up" className={cn(card, "border-s-4 p-5 lg:col-start-1 lg:row-start-1 lg:p-6", toneStyles[hero.tone].stripe)}>
            <div className="lg:grid lg:grid-cols-[0.8fr_1.2fr] lg:gap-8">
              <div>
                <SectionLabel id="next-up">{t.dashboard.nextToExpire}</SectionLabel>
                <p className="mt-3 text-2xl font-semibold leading-tight text-foreground"><bdi>{hero.person}</bdi></p>
                <p className="mt-0.5 text-sm text-foreground-muted" dir="auto">{hero.title}</p>
                <div className="mt-3"><StatusLine rx={hero} /></div>
              </div>
              <div className="mt-6 border-border-subtle lg:mt-0 lg:border-s lg:ps-8">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="flex items-baseline gap-2">
                    <span className="text-5xl font-semibold leading-none tabular-nums text-foreground">{remainingPacks(hero)}</span>
                    <span className="text-sm font-medium text-foreground-muted">{t.dashboard.packsLeft}</span>
                  </p>
                  <p className="text-xs tabular-nums text-foreground-muted">{fill(t.dashboard.packsUsedOf, { used: hero.usedPacks, total: hero.totalPacks })}</p>
                </div>
                <div className="mt-4"><PackPips total={hero.totalPacks} used={hero.usedPacks} tone={hero.tone} size="lg" /></div>
                <div className="mt-5"><PackUsage key={hero.id} rx={hero} onUse={onUsePacks} large /></div>
              </div>
            </div>
          </section>
        ) : (
          <section className={cn(card, "lg:col-start-1 lg:row-start-1")}>
            <EmptyState icon={<NavIcon name="dashboard" />} title={t.common.empty} message={t.dashboard.upcomingExpirations} />
          </section>
        )}

        {/* Stats: one lightly bordered group, no card per stat. gap-px keeps hairlines identical in LTR/RTL. */}
        <dl className="grid grid-cols-4 gap-px overflow-hidden rounded-[var(--radius-panel)] border border-border bg-border lg:col-start-2 lg:row-start-1 lg:grid-cols-2">
          {([
            [t.dashboard.summary.active, model.summary.active, "text-status-healthy"],
            [t.dashboard.summary.expiringSoon, model.summary.expiringSoon, "text-status-warning"],
            [t.dashboard.summary.expired, model.summary.expired, "text-status-danger"],
            [t.dashboard.summary.issued, model.summary.issued, "text-status-issued"],
          ] as const).map(([label, value, color]) => (
            <div key={label} className="flex flex-col items-center justify-center bg-surface px-2 py-4 text-center">
              <dd className={cn("text-3xl font-semibold leading-none tabular-nums", color)}>{value}</dd>
              <dt className="mt-1.5 text-xs leading-tight text-foreground-muted">{label}</dt>
            </div>
          ))}
        </dl>

        {/* Prescriptions with per-person filter */}
        <section aria-labelledby="rx-list" className="lg:col-start-1 lg:row-start-2">
          <SectionLabel id="rx-list" count={visible.length}>{t.dashboard.prescriptions}</SectionLabel>
          {visible.length === 0 ? (
            <div className={cn(card, "mt-3")}><EmptyState icon={<NavIcon name="dashboard" />} title={t.common.empty} message={t.dashboard.upcomingExpirations} /></div>
          ) : (
            <>
              {people.length > 1 && (
                <div role="group" aria-label={t.dashboard.prescriptions} className="-mx-3 mt-3 flex gap-2 overflow-x-auto px-3 pb-1 [scrollbar-width:none] sm:-mx-4 sm:px-4 md:mx-0 md:px-0 [&::-webkit-scrollbar]:hidden">
                  {["all", ...people].map((p) => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={activeFilter === p}
                      onClick={() => setFilter(p)}
                      className={cn(
                        "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors",
                        press,
                        activeFilter === p ? "border-accent bg-accent-subtle text-accent" : "border-border bg-surface text-foreground-muted hover:bg-border-subtle",
                      )}
                    >
                      {p === "all" ? t.person.filterAll : <bdi>{p}</bdi>}
                    </button>
                  ))}
                </div>
              )}
              <ul className="mt-3 flex flex-col gap-3">
                {visible.map((rx) => {
                  const k = toneStyles[rx.tone];
                  return (
                    <li key={rx.id} className={cn(card, "border-s-4 p-4", k.stripe)}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-base font-medium text-foreground"><bdi>{rx.person}</bdi></p>
                          <p className="text-sm leading-snug text-foreground-muted" dir="auto">{rx.title}</p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <StatusBadge status="active" daysLeft={rx.daysLeft} />
                          <p className={cn("text-xs font-medium tabular-nums", k.text)}>{daysLabel(t, rx.daysLeft, rx.fallbackDaysLabel)}</p>
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-end gap-4">
                        <div className="min-w-[8rem] flex-1">
                          <PackPips total={rx.totalPacks} used={rx.usedPacks} tone={rx.tone} />
                          <p className="mt-2 text-xs tabular-nums text-foreground-muted">
                            {remainingPacks(rx)} {t.dashboard.packsLeft} · {fill(t.dashboard.packsUsedOf, { used: rx.usedPacks, total: rx.totalPacks })}
                          </p>
                        </div>
                        <PackUsage key={rx.id} rx={rx} onUse={onUsePacks} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </section>

        <div className="flex flex-col gap-5 lg:col-start-2 lg:row-start-2">
          {/* Per-person summary (kept from the original dashboard) */}
          <section aria-labelledby="per-person">
            <SectionLabel id="per-person">{t.dashboard.perPerson}</SectionLabel>
            <ul className={cn(card, "mt-3 divide-y divide-border-subtle px-4")}>
              {model.perPerson.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground"><bdi>{p.fullName}</bdi></p>
                    <p className="mt-0.5 text-xs text-foreground-muted">
                      {t.people.activeCount}: {p.active} · {t.people.issuedCount}: {p.issued}
                    </p>
                  </div>
                  <p className={cn("flex shrink-0 items-center gap-1.5 text-xs tabular-nums", p.tone && p.tone !== "active" ? cn("font-medium", toneStyles[p.tone].text) : "text-foreground-subtle")}>
                    {p.tone && p.tone !== "active" ? <span aria-hidden="true" className={cn("size-2 rounded-full", toneStyles[p.tone].dot)} /> : null}
                    <span dir="ltr">{p.nearestExpiration ?? "—"}</span>
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="activity">
            <SectionLabel id="activity">{t.dashboard.recentActivity}</SectionLabel>
            {model.activity.length ? (
              <ul className={cn(card, "mt-3 divide-y divide-border-subtle px-4")}>
                {model.activity.map((a) => (
                  <li key={a.id} className="py-3">
                    <p className="text-sm font-medium text-foreground" dir="auto">{a.title}</p>
                    <p className="mt-0.5 text-xs text-foreground-muted"><bdi>{a.person}</bdi> · <bdi>{a.action}</bdi></p>
                    <p className="mt-0.5 text-xs tabular-nums text-foreground-subtle">{a.when}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={cn(card, "mt-3")}><EmptyState icon={<NavIcon name="notifications" />} title={t.common.empty} message={t.dashboard.recentActivity} /></div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
