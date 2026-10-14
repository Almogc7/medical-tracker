import { describe, expect, it } from "vitest";

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
} from "@/components/prescriptions/upload-model";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";

describe("validatePdfFile (mirrors the server rules)", () => {
  it("accepts a PDF within the server limit, including exactly at the limit", () => {
    expect(validatePdfFile({ type: "application/pdf", size: 1000 })).toBeNull();
    expect(validatePdfFile({ type: "application/pdf", size: MAX_UPLOAD_SIZE_BYTES })).toBeNull();
  });
  it("rejects other types and anything over the server limit", () => {
    expect(validatePdfFile({ type: "image/png", size: 10 })).toBe("type");
    expect(validatePdfFile({ type: "", size: 10 })).toBe("type");
    expect(validatePdfFile({ type: "application/pdf", size: MAX_UPLOAD_SIZE_BYTES + 1 })).toBe("size");
  });
  it("uses the real backend limit (8 MB), not the old 20 MB UI constant", () => {
    expect(MAX_UPLOAD_MB).toBe(8);
  });
});

describe("initialMonthEntries (same rules as the previous form)", () => {
  it("prefers detected monthly ranges and drops incomplete ones", () => {
    const m = initialMonthEntries({
      monthEntries: [{ startDate: "2026-10-01", expirationDate: "2026-10-31" }, { startDate: "", expirationDate: "2026-11-30" }, { startDate: "2026-11-01", expirationDate: "2026-11-30" }],
      startDate: "2026-01-01",
      expirationDate: "2026-01-31",
    });
    expect(m).toEqual([{ startDate: "2026-10-01", expirationDate: "2026-10-31" }, { startDate: "2026-11-01", expirationDate: "2026-11-30" }]);
  });
  it("falls back to the single detected pair", () => {
    expect(initialMonthEntries({ monthEntries: [], startDate: "2026-10-01", expirationDate: "2026-10-31" })).toEqual([{ startDate: "2026-10-01", expirationDate: "2026-10-31" }]);
    expect(initialMonthEntries({ startDate: "2026-10-01", expirationDate: "2026-10-31" })).toHaveLength(1);
  });
  it("returns nothing when no dates were detected", () => {
    expect(initialMonthEntries({ monthEntries: [], startDate: "", expirationDate: "" })).toEqual([]);
  });
});

describe("confidenceLevel", () => {
  it("maps the backend values", () => {
    expect([0.95, 0.8, 0.4, 0].map(confidenceLevel)).toEqual(["high", "high", "check", "none"]);
  });
});

describe("entry validation", () => {
  it("requires every date and a non-reversed range", () => {
    expect(entriesValid([])).toBe(false);
    expect(entriesValid([{ startDate: "2026-10-01", expirationDate: "2026-10-31" }])).toBe(true);
    expect(entriesValid([{ startDate: "2026-10-01", expirationDate: "2026-10-01" }])).toBe(true);
    expect(entriesValid([{ startDate: "2026-10-31", expirationDate: "2026-10-01" }])).toBe(false);
    expect(entriesValid([{ startDate: "", expirationDate: "2026-10-01" }])).toBe(false);
  });
  it("reports which problem an entry has", () => {
    expect(entryProblem({ startDate: "", expirationDate: "" })).toBe("missing");
    expect(entryProblem({ startDate: "2026-10-31", expirationDate: "2026-10-01" })).toBe("order");
    expect(entryProblem({ startDate: "2026-10-01", expirationDate: "2026-10-31" })).toBeNull();
  });
});

describe("resultingTitle / formatFileSize", () => {
  it("matches the backend naming '<title> - Month N'", () => {
    expect([0, 1, 2].map((i) => resultingTitle("  Monthly Rx ", i))).toEqual(["Monthly Rx - Month 1", "Monthly Rx - Month 2", "Monthly Rx - Month 3"]);
  });
  it("formats sizes", () => {
    expect([500, 2048, 5 * 1024 * 1024].map(formatFileSize)).toEqual(["500 B", "2 KB", "5.0 MB"]);
  });
});

describe("buildSavePayload keeps the create-bulk contract", () => {
  it("has exactly the fields the API expects", () => {
    const payload = buildSavePayload({
      personId: "p1",
      title: "Rx",
      notes: "n",
      totalPacks: 6,
      entries: [{ startDate: "2026-10-01", expirationDate: "2026-10-31" }],
      parsed: { uploadToken: "tok", originalFileName: "a.pdf", extractedText: "text" },
    });
    expect(Object.keys(payload).sort()).toEqual(["baseTitle", "extractedText", "monthEntries", "notes", "originalFileName", "personId", "totalPacks", "uploadToken"]);
    expect(payload).toMatchObject({ personId: "p1", baseTitle: "Rx", totalPacks: 6, uploadToken: "tok" });
  });
});

describe("titleFromFileName", () => {
  it("turns a chosen file name into a readable default title", () => {
    expect(titleFromFileName("Noa Rx_October.pdf")).toBe("Noa Rx October");
    expect(titleFromFileName("monthly-rx--nov.PDF")).toBe("monthly rx nov");
    expect(titleFromFileName("נועה אוקטובר.pdf")).toBe("נועה אוקטובר");
    expect(titleFromFileName(".pdf")).toBe("");
  });
});
