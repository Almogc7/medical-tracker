"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";

import { fill } from "@/components/prescriptions/prescription-format";
import {
  MAX_UPLOAD_MB,
  buildSavePayload,
  confidenceLevel,
  entriesValid,
  entryProblem,
  formatFileSize,
  initialMonthEntries,
  resultingTitle,
  titleFromFileName,
  validatePdfFile,
  type MonthEntry,
  type ParseResult,
  type SavePayload,
} from "@/components/prescriptions/upload-model";
import { AlertIcon, CheckIcon, NavIcon } from "@/components/layout/nav-icons";
import { Banner } from "@/components/ui/banner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/ui/locale-provider";
import { Select } from "@/components/ui/select";
import { isolate } from "@/utils/bidi";
import { cn } from "@/utils/cn";

export type PersonOption = { id: string; fullName: string };

type Phase = "choose" | "reading" | "review" | "done";

const press = "touch-manipulation select-none active:scale-[0.98] active:brightness-95";
const card = "rounded-[var(--radius-panel)] border border-border bg-surface";
const messageOf = (e: unknown) => (e instanceof Error && e.message ? e.message : "");

const icon = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": true } as const;
const UploadIcon = () => <svg {...icon} className="text-accent"><path d="M12 16V5m0 0-4 4m4-4 4 4M5 19h14" /></svg>;
const FileIcon = () => <svg {...icon} className="shrink-0 text-accent"><path d="M7 3h7l5 5v13H7zM14 3v5h5" /></svg>;

/**
 * Upload wizard: choose a PDF, review what was detected, save, done.
 * `parsePdf` and `savePrescriptions` are injected so the view never talks to the backend itself
 * (see upload-form.tsx for the real implementations, which call the existing API routes unchanged).
 */
export function UploadWizard({
  people,
  parsePdf,
  savePrescriptions,
}: {
  people: PersonOption[];
  parsePdf: (file: File) => Promise<ParseResult>;
  savePrescriptions: (payload: SavePayload) => Promise<{ count: number }>;
}) {
  const { t } = useLocale();
  const fileId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const [phase, setPhase] = useState<Phase>("choose");
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<"type" | "size" | null>(null);
  const [dragging, setDragging] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [totalPacks, setTotalPacks] = useState(1);
  const [entries, setEntries] = useState<MonthEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const person = people.find((p) => p.id === personId);

  // Move focus to the step heading whenever the step changes (not on first paint).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [phase]);

  function pickFile(f: File | null) {
    setReadError(null);
    if (!f) {
      setFile(null);
      setFileError(null);
      return;
    }
    const problem = validatePdfFile(f);
    setFileError(problem);
    setFile(problem ? null : f);
    if (problem && inputRef.current) inputRef.current.value = "";
  }

  function clearFile() {
    pickFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function readPdf() {
    if (!file || !personId) return;
    setReadError(null);
    setPhase("reading");
    try {
      const result = await parsePdf(file);
      setParsed(result);
      setTitle(titleFromFileName(file.name) || result.suggestedTitle || "");
      setTotalPacks(result.suggestedPacks && result.suggestedPacks > 0 ? result.suggestedPacks : 1);
      setEntries(initialMonthEntries(result));
      setNotes("");
      setSaveError(null);
      setPhase("review");
    } catch (e) {
      setReadError(messageOf(e) || t.prescriptions.parseError);
      setPhase("choose");
    }
  }

  const canSave = Boolean(parsed) && Boolean(personId) && title.trim().length > 0 && entriesValid(entries) && !saving;

  async function save() {
    if (!parsed || !canSave) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { count } = await savePrescriptions(buildSavePayload({ personId, title, notes, totalPacks, entries, parsed }));
      setSavedCount(count);
      setPhase("done");
    } catch (e) {
      setSaveError(messageOf(e) || t.upload.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  function restart() {
    setPhase("choose");
    setFile(null);
    setFileError(null);
    setReadError(null);
    setParsed(null);
    setEntries([]);
    setTitle("");
    setNotes("");
    setTotalPacks(1);
    setSaveError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const updateEntry = (i: number, patch: Partial<MonthEntry>) => setEntries((l) => l.map((e, idx) => (idx === i ? { ...e, ...patch } : e)));

  const stepIndex = phase === "review" ? 1 : phase === "done" ? 2 : 0;
  const steps = [t.upload.stepChoose, t.upload.stepReview, t.upload.stepDone];

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">{t.common.uploadPrescription}</h1>
      <p className="mt-1 text-sm text-foreground-muted">{t.prescriptions.uploadHelper}</p>

      {/* Progress: three steps */}
      <ol className="mt-5 grid grid-cols-3 gap-2" aria-label={t.common.uploadPrescription}>
        {steps.map((label, i) => {
          const state = i < stepIndex ? "done" : i === stepIndex ? "current" : "todo";
          return (
            <li key={label} aria-current={state === "current" ? "step" : undefined} className="min-w-0">
              <div className={cn("h-1.5 rounded-full", state === "todo" ? "bg-border" : "bg-accent")} />
              <p className={cn("mt-2 flex items-center gap-1.5 text-xs font-medium", state === "current" ? "text-accent" : state === "done" ? "text-foreground-muted" : "text-foreground-subtle")}>
                <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full text-[11px] tabular-nums", state === "todo" ? "bg-border-subtle" : "bg-accent text-accent-fg")}>
                  {state === "done" ? <CheckIcon className="size-3.5" /> : i + 1}
                </span>
                <span className="truncate">{label}</span>
              </p>
            </li>
          );
        })}
      </ol>

      {/* ── Step 1: choose person + PDF ───────────────────────────────────────────────────────────── */}
      {phase === "choose" && (
        <section className={cn(card, "mt-5 space-y-5 p-4 md:p-5")} aria-labelledby="step-choose">
          <h2 id="step-choose" ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-foreground focus:outline-none">{t.upload.stepChoose}</h2>

          {people.length === 0 ? (
            <div>
              <EmptyState icon={<NavIcon name="people" />} title={t.upload.noPeopleTitle} message={t.prescriptions.noPeopleAvailable} />
              <Link href="/people" className={cn("mx-auto flex h-12 w-full max-w-xs items-center justify-center rounded-[var(--radius-component)] bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover", press)}>
                {t.upload.goToPeople}
              </Link>
            </div>
          ) : (
            <>
              <Select label={t.upload.personLabel} value={personId} onChange={(e) => setPersonId(e.target.value)} className="h-11">
                {people.map((p) => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </Select>

              <div>
                <input ref={inputRef} id={fileId} type="file" accept="application/pdf" aria-label="PDF" tabIndex={-1} className="sr-only" onChange={(e) => pickFile(e.target.files?.[0] ?? null)} />

                {file ? (
                  <div className="flex items-center gap-3 rounded-[var(--radius-component)] border border-border bg-canvas p-3">
                    <FileIcon />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground" dir="auto">{file.name}</p>
                      <p className="text-xs tabular-nums text-foreground-muted">{formatFileSize(file.size)}</p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" className={press} onClick={clearFile} aria-label={t.upload.removeFile}>
                      {t.upload.removeFile}
                    </Button>
                  </div>
                ) : (
                  <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0] ?? null); }}>
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className={cn(
                        "flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-[var(--radius-panel)] border-2 border-dashed px-4 py-8 text-center transition-colors",
                        press,
                        dragging ? "border-accent bg-accent-subtle" : "border-border bg-canvas hover:bg-border-subtle",
                      )}
                    >
                      <UploadIcon />
                      <span className="text-base font-semibold text-foreground">{t.upload.dropTitle}</span>
                      <span className="text-sm text-foreground-muted">{t.upload.dropHint}</span>
                      <span className="text-xs text-foreground-subtle">{fill(t.upload.pdfLimit, { mb: MAX_UPLOAD_MB })}</span>
                    </button>
                  </div>
                )}

                {fileError ? (
                  <p role="alert" className="mt-2 text-sm font-medium text-status-danger">
                    {fileError === "type" ? t.prescriptions.invalidFile : fill(t.upload.tooLarge, { mb: MAX_UPLOAD_MB })}
                  </p>
                ) : null}
              </div>

              {readError ? (
                <Banner tone="error" title={t.upload.readFailed}>{readError}</Banner>
              ) : null}

              <Button type="button" variant="primary" size="lg" className={cn("w-full", press)} disabled={!file || !personId} onClick={readPdf}>
                {readError ? t.upload.tryAgain : t.upload.readPdf}
              </Button>
            </>
          )}
        </section>
      )}

      {/* ── Reading (uploading + parsing) ─────────────────────────────────────────────────────────── */}
      {phase === "reading" && (
        <section className={cn(card, "mt-5 p-6 text-center")} aria-labelledby="step-reading" role="status" aria-live="polite" aria-busy="true">
          <svg className="mx-auto size-10 animate-spin text-accent" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" className="opacity-20" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <h2 id="step-reading" ref={headingRef} tabIndex={-1} className="mt-4 text-lg font-semibold text-foreground focus:outline-none">{t.upload.reading}</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">{t.upload.readingHint}</p>
          {file ? <p className="mt-3 truncate text-xs text-foreground-subtle" dir="auto">{file.name}</p> : null}
        </section>
      )}

      {/* ── Step 2: review detected details ───────────────────────────────────────────────────────── */}
      {phase === "review" && parsed && (
        <section className="mt-5" aria-labelledby="step-review">
          <h2 id="step-review" ref={headingRef} tabIndex={-1} className="text-lg font-semibold text-foreground focus:outline-none">{t.upload.reviewTitle}</h2>
          <p className="mt-1 text-sm text-foreground-muted">{t.upload.reviewIntro}</p>

          <div className="mt-4 grid gap-5 lg:grid-cols-[minmax(0,1fr)_17rem] lg:items-start">
            {/* Detected summary (first on mobile, side column on desktop) */}
            <aside aria-labelledby="detected" className={cn(card, "p-4 lg:col-start-2 lg:row-start-1")}>
              <h3 id="detected" className="text-xs font-semibold text-foreground-muted">{t.upload.detectedHeading}</h3>
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between gap-3"><dt className="text-foreground-muted">{t.upload.fileLabel}</dt><dd className="min-w-0 truncate font-medium text-foreground" dir="auto">{file?.name ?? parsed.originalFileName}</dd></div>
                <div className="flex justify-between gap-3"><dt className="text-foreground-muted">{t.upload.forLabel}</dt><dd className="min-w-0 truncate font-medium text-foreground"><bdi>{person?.fullName}</bdi></dd></div>
              </dl>
              <ul className="mt-3 space-y-2 border-t border-border-subtle pt-3 text-sm">
                <li className="flex items-start gap-2">
                  {parsed.suggestedPacks ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" /> : <AlertIcon className="mt-0.5 size-4 shrink-0 text-status-warning" />}
                  <span className={parsed.suggestedPacks ? "text-foreground" : "text-status-warning"}>
                    {parsed.suggestedPacks ? fill(t.upload.packsDetected, { n: parsed.suggestedPacks }) : t.upload.packsNotDetected}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  {initialMonthEntries(parsed).length ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" /> : <AlertIcon className="mt-0.5 size-4 shrink-0 text-status-warning" />}
                  <span className="text-foreground">{fill(t.upload.monthsDetected, { n: initialMonthEntries(parsed).length })}</span>
                </li>
                <li className="flex items-start gap-2">
                  {confidenceLevel(parsed.confidence) === "high" ? <CheckIcon className="mt-0.5 size-4 shrink-0 text-accent" /> : <AlertIcon className="mt-0.5 size-4 shrink-0 text-status-warning" />}
                  <span className={confidenceLevel(parsed.confidence) === "high" ? "text-foreground" : "text-status-warning"}>
                    {{ high: t.upload.confHigh, check: t.upload.confCheck, none: t.upload.confNone }[confidenceLevel(parsed.confidence)]}
                  </span>
                </li>
              </ul>
            </aside>

            <div className="space-y-4 lg:col-start-1 lg:row-start-1">
              <div className={cn(card, "grid gap-4 p-4 sm:grid-cols-[minmax(0,1fr)_9rem]")}>
                <Input label={t.prescriptions.table.title} value={title} onChange={(e) => setTitle(e.target.value)} error={title.trim() ? undefined : t.upload.titleRequired} className="h-11" dir="auto" />
                <Input
                  label={t.prescriptions.totalPacks}
                  type="number"
                  min={1}
                  inputMode="numeric"
                  value={totalPacks}
                  onChange={(e) => setTotalPacks(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  hint={parsed.suggestedPacks ? undefined : t.upload.packsNotDetected}
                  className="h-11"
                />
              </div>

              <div>
                <h3 className="text-xs font-semibold text-foreground-muted">{t.upload.monthsHeading}</h3>
                <ul className="mt-2 space-y-3">
                  {entries.map((entry, i) => {
                    const problem = entryProblem(entry);
                    return (
                      <li key={i} className={cn(card, "p-4")}>
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">{fill(t.upload.monthN, { n: i + 1 })}</p>
                          <Button type="button" variant="danger" size="sm" className={press} disabled={saving} aria-label={`${t.prescriptions.removeMonth}: ${fill(t.upload.monthN, { n: i + 1 })}`} onClick={() => setEntries((l) => l.filter((_, idx) => idx !== i))}>
                            {t.prescriptions.removeMonth}
                          </Button>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <Input label={t.common.startsOn} type="date" value={entry.startDate} onChange={(e) => updateEntry(i, { startDate: e.target.value })} className="h-11 min-w-0" disabled={saving} />
                          <Input label={t.common.expiresOn} type="date" value={entry.expirationDate} onChange={(e) => updateEntry(i, { expirationDate: e.target.value })} className="h-11 min-w-0" disabled={saving} />
                        </div>
                        {problem ? <p role="alert" className="mt-2 text-xs font-medium text-status-danger">{t.upload.datesInvalid}</p> : null}
                        {title.trim() ? <p className="mt-2 text-xs text-foreground-muted" dir="auto">{fill(t.upload.savedAs, { title: isolate(resultingTitle(title, i)) })}</p> : null}
                      </li>
                    );
                  })}
                </ul>
                {entries.length === 0 ? <p role="status" className="mt-2 text-sm text-foreground-muted">{t.upload.noMonthsLeft}</p> : null}
                <Button type="button" variant="secondary" size="md" className={cn("mt-3 w-full sm:w-auto", press)} disabled={saving} onClick={() => setEntries((l) => [...l, { startDate: "", expirationDate: "" }])}>
                  + {t.upload.addMonth}
                </Button>
              </div>

              <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground-muted">
                {t.common.notes}
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} disabled={saving} dir="auto" className="w-full rounded-[var(--radius-component)] border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-60" />
              </label>

              {saveError ? (
                <Banner tone="error" title={t.upload.saveFailed}>{saveError}</Banner>
              ) : null}

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                <Button type="button" variant="secondary" size="lg" className={cn("w-full sm:w-auto", press)} disabled={saving} onClick={() => setPhase("choose")}>
                  {t.upload.back}
                </Button>
                <Button type="button" variant="primary" size="lg" className={cn("w-full sm:w-auto", press)} disabled={!canSave} loading={saving} onClick={save}>
                  {saving ? t.upload.saving : entries.length === 0 ? t.prescriptions.saveAllMonths : entries.length === 1 ? t.upload.saveOne : fill(t.upload.saveMany, { n: entries.length })}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Step 3: done ──────────────────────────────────────────────────────────────────────────── */}
      {phase === "done" && (
        <section className={cn(card, "mt-5 p-6 text-center")} aria-labelledby="step-done" role="status">
          <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent-subtle text-accent"><CheckIcon className="size-7" /></span>
          <h2 id="step-done" ref={headingRef} tabIndex={-1} className="mt-4 text-xl font-semibold text-foreground focus:outline-none">{t.upload.doneTitle}</h2>
          <p className="mt-1 text-sm text-foreground-muted">
            {savedCount === 1 ? fill(t.upload.doneOne, { name: isolate(person?.fullName ?? "") }) : fill(t.upload.doneMany, { n: savedCount, name: isolate(person?.fullName ?? "") })}
          </p>
          <div className="mx-auto mt-6 flex max-w-sm flex-col gap-2">
            <Link href={`/people/${personId}`} className={cn("flex h-12 items-center justify-center rounded-[var(--radius-component)] bg-accent px-4 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-hover", press)}>
              {t.upload.viewPrescriptions}
            </Link>
            <Button type="button" variant="secondary" size="lg" className={press} onClick={restart}>{t.upload.uploadAnother}</Button>
          </div>
        </section>
      )}
    </div>
  );
}
