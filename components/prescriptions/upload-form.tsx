"use client";

import { UploadWizard, type PersonOption } from "@/components/prescriptions/upload-wizard";
import type { ParseResult, SavePayload } from "@/components/prescriptions/upload-model";

/**
 * The real upload flow. Requests are unchanged from the previous form:
 *   POST /api/prescriptions/parse        (multipart, field "file")  -> ParseResult
 *   POST /api/prescriptions/create-bulk  (JSON SavePayload)         -> { ok, count }
 * Errors carry the server's message when there is one; an empty message makes the wizard use its own wording.
 */
async function parsePdf(file: File): Promise<ParseResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch("/api/prescriptions/parse", { method: "POST", body: formData });
  } catch {
    throw new Error(""); // network failure
  }

  const payload = (await response.json().catch(() => ({}))) as ParseResult | { error?: string };
  if (!response.ok) throw new Error("error" in payload && payload.error ? payload.error : "");
  return payload as ParseResult;
}

async function savePrescriptions(payload: SavePayload): Promise<{ count: number }> {
  let response: Response;
  try {
    response = await fetch("/api/prescriptions/create-bulk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(""); // network failure
  }

  const body = (await response.json().catch(() => ({}))) as { error?: string; count?: number };
  if (!response.ok) throw new Error(body.error ?? "");
  return { count: typeof body.count === "number" ? body.count : payload.monthEntries.length };
}

export function UploadForm({ people }: { people: PersonOption[] }) {
  return <UploadWizard people={people} parsePdf={parsePdf} savePrescriptions={savePrescriptions} />;
}
