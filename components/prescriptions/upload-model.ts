import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";

// Pure helpers for the upload wizard. Types mirror the EXISTING API contracts exactly
// (POST /api/prescriptions/parse and POST /api/prescriptions/create-bulk); nothing here talks to the network.

export type MonthEntry = { startDate: string; expirationDate: string };

/** Response of POST /api/prescriptions/parse. */
export type ParseResult = {
  uploadToken: string;
  originalFileName: string;
  extractedText: string;
  suggestedTitle: string;
  startDate: string;
  expirationDate: string;
  confidence: number;
  suggestedPacks: number | null;
  monthEntries?: MonthEntry[];
};

/** Body of POST /api/prescriptions/create-bulk. */
export type SavePayload = {
  personId: string;
  baseTitle: string;
  notes: string;
  totalPacks: number;
  monthEntries: MonthEntry[];
  uploadToken: string;
  originalFileName: string;
  extractedText: string;
};

export const MAX_UPLOAD_MB = MAX_UPLOAD_SIZE_BYTES / (1024 * 1024);

/** The server accepts only application/pdf up to MAX_UPLOAD_SIZE_BYTES; mirror that so errors appear before uploading. */
export function validatePdfFile(file: { type: string; size: number }): "type" | "size" | null {
  if (file.type !== "application/pdf") return "type";
  if (file.size > MAX_UPLOAD_SIZE_BYTES) return "size";
  return null;
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Month rows to review: the detected monthly ranges, else the single detected pair, else none (user adds them). */
export function initialMonthEntries(result: Pick<ParseResult, "monthEntries" | "startDate" | "expirationDate">): MonthEntry[] {
  const entries = Array.isArray(result.monthEntries) ? result.monthEntries.filter((e) => e.startDate && e.expirationDate) : [];
  if (entries.length) return entries.map(({ startDate, expirationDate }) => ({ startDate, expirationDate }));
  return result.startDate && result.expirationDate ? [{ startDate: result.startDate, expirationDate: result.expirationDate }] : [];
}

/** Maps the backend's confidence values (0.95 monthly ranges, 0.8 two dates, 0.4 one date, 0 none). */
export function confidenceLevel(confidence: number): "high" | "check" | "none" {
  if (confidence >= 0.8) return "high";
  if (confidence > 0) return "check";
  return "none";
}

/** Every date filled, and each expiration on or after its start (ISO yyyy-MM-dd strings compare correctly). */
export function entriesValid(entries: MonthEntry[]) {
  return entries.length > 0 && entries.every((e) => Boolean(e.startDate) && Boolean(e.expirationDate) && e.expirationDate >= e.startDate);
}

export function entryProblem(entry: MonthEntry): "missing" | "order" | null {
  if (!entry.startDate || !entry.expirationDate) return "missing";
  return entry.expirationDate < entry.startDate ? "order" : null;
}

/**
 * Default title from the file the user chose ("Noa Rx_October.pdf" -> "Noa Rx October"). The server's suggestion is built
 * from a sanitized name plus a random token (and loses non-ASCII letters, e.g. Hebrew), so it is only a fallback.
 */
export function titleFromFileName(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

/** The title the backend will store for month `index` (create-bulk appends " - Month N"). */
export const resultingTitle = (baseTitle: string, index: number) => `${baseTitle.trim()} - Month ${index + 1}`;

export function buildSavePayload(input: {
  personId: string;
  title: string;
  notes: string;
  totalPacks: number;
  entries: MonthEntry[];
  parsed: Pick<ParseResult, "uploadToken" | "originalFileName" | "extractedText">;
}): SavePayload {
  return {
    personId: input.personId,
    baseTitle: input.title,
    notes: input.notes,
    totalPacks: input.totalPacks,
    monthEntries: input.entries,
    uploadToken: input.parsed.uploadToken,
    originalFileName: input.parsed.originalFileName,
    extractedText: input.parsed.extractedText,
  };
}
