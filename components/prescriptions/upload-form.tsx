"use client";

import { useMemo, useState } from "react";

import { useLocale } from "@/components/ui/locale-provider";

type PersonOption = { id: string; fullName: string };

type ParseResult = {
  uploadToken: string;
  originalFileName: string;
  extractedText: string;
  suggestedTitle: string;
  startDate: string;
  expirationDate: string;
  confidence: number;
  monthEntries?: { startDate: string; expirationDate: string }[];
};

type MonthEntry = {
  startDate: string;
  expirationDate: string;
};

export function UploadForm({ people }: { people: PersonOption[] }) {
  const { t } = useLocale();
  const [personId, setPersonId] = useState(people[0]?.id ?? "");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParseResult | null>(null);
  const [monthEntries, setMonthEntries] = useState<MonthEntry[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);

  const canParse = useMemo(() => Boolean(file) && !parsing, [file, parsing]);

  async function parsePdf() {
    if (!file) {
      return;
    }

    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      setParsing(true);
      const response = await fetch("/api/prescriptions/parse", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => ({}))) as ParseResult | { error?: string };

      if (!response.ok) {
        setMessage("error" in payload ? payload.error || t.prescriptions.parseError : t.prescriptions.parseError);
        return;
      }

      const parseResult = payload as ParseResult;
      setParsed(parseResult);
      setTitle(parseResult.suggestedTitle || title);
      const parsedEntries = Array.isArray(parseResult.monthEntries)
        ? parseResult.monthEntries.filter((entry: MonthEntry) => entry.startDate && entry.expirationDate)
        : [];

      const fallbackEntry = parseResult.startDate && parseResult.expirationDate
        ? [{ startDate: parseResult.startDate, expirationDate: parseResult.expirationDate }]
        : [];

      setMonthEntries(parsedEntries.length ? parsedEntries : fallbackEntry);
      setMessage(parsedEntries.length > 1 ? t.prescriptions.monthlyDetected : t.prescriptions.reviewMessage);
    } catch {
      setMessage(t.prescriptions.parseError);
    } finally {
      setParsing(false);
    }
  }

  async function savePrescription() {
    if (!parsed) {
      return;
    }

    if (!personId) {
      setMessage(t.prescriptions.selectPersonBeforeSave);
      return;
    }

    if (!title) {
      return;
    }

    if (!monthEntries.length) {
      setMessage(t.prescriptions.nothingToSave);
      return;
    }

    setSaving(true);
    setMessage(null);

    const response = await fetch("/api/prescriptions/create-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personId,
        baseTitle: title,
        notes,
        monthEntries,
        uploadToken: parsed.uploadToken,
        originalFileName: parsed.originalFileName,
        extractedText: parsed.extractedText,
      }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(payload.error || "Could not save prescription");
      return;
    }

    setMessage("Saved successfully");
    setParsed(null);
    setFile(null);
    setMonthEntries([]);
    setTitle("");
    setNotes("");
  }

  function updateMonthEntry(index: number, patch: Partial<MonthEntry>) {
    setMonthEntries((current) =>
      current.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, ...patch } : entry,
      ),
    );
  }

  function removeMonthEntry(index: number) {
    setMonthEntries((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-600">{t.prescriptions.uploadHelper}</p>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="text-slate-600">{t.sidebar.people}</span>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={personId}
            onChange={(event) => setPersonId(event.target.value)}
            disabled={!people.length}
          >
            {!people.length ? <option value="">{t.prescriptions.noPeopleAvailable}</option> : null}
            {people.map((person) => (
              <option key={person.id} value={person.id}>
                {person.fullName}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="text-slate-600">PDF</span>
          <input
            type="file"
            accept="application/pdf"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <button
        type="button"
        disabled={!canParse}
        onClick={parsePdf}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {parsing ? t.common.loading : "Parse PDF"}
      </button>

      {parsed ? (
        <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <label className="block space-y-1 text-sm">
            <span className="text-slate-600">{t.prescriptions.table.title}</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            />
          </label>

          {monthEntries.map((entry, index) => (
            <div key={`${entry.startDate}-${entry.expirationDate}-${index}`} className="space-y-2 rounded-lg border border-amber-200 bg-white p-3">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">{t.common.startsOn}</span>
                  <input
                    type="date"
                    value={entry.startDate}
                    onChange={(event) => updateMonthEntry(index, { startDate: event.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="text-slate-600">{t.common.expiresOn}</span>
                  <input
                    type="date"
                    value={entry.expirationDate}
                    onChange={(event) => updateMonthEntry(index, { expirationDate: event.target.value })}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={() => removeMonthEntry(index)}
                className="rounded-lg border border-rose-300 px-3 py-1 text-xs font-semibold text-rose-700"
              >
                {t.prescriptions.removeMonth}
              </button>
            </div>
          ))}

          <label className="block space-y-1 text-sm">
            <span className="text-slate-600">{t.common.notes}</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              rows={3}
            />
          </label>

          <button
            type="button"
            onClick={savePrescription}
            disabled={saving || !personId}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving ? t.common.loading : t.prescriptions.saveAllMonths}
          </button>
        </div>
      ) : null}

      {message ? <p className="text-sm text-slate-600">{message}</p> : null}
    </div>
  );
}
