import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { put } from "@vercel/blob";

import { NextResponse } from "next/server";

import { getApiSession } from "@/lib/auth";
import { MAX_UPLOAD_SIZE_BYTES } from "@/lib/constants";
import { formatDateInIsrael } from "@/utils/date";
import { generateStoredFilename, sanitizeFilename } from "@/utils/files";
import { detectDatesFromText, detectMonthlyDateRangesFromText, extractPdfText } from "@/utils/pdf";

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return NextResponse.json({ error: "File exceeds size limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";
  try {
    extractedText = await extractPdfText(buffer);
  } catch {
    extractedText = "";
  }

  const parsed = detectDatesFromText(extractedText);
  const monthlyRanges = detectMonthlyDateRangesFromText(extractedText);
  let uploadToken: string = randomUUID();
  const filename = generateStoredFilename(file.name);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`prescriptions/${filename}`, buffer, {
      access: "public",
      contentType: "application/pdf",
      addRandomSuffix: false,
    });

    uploadToken = blob.url;
  } else {
    const tempDir = path.join(process.cwd(), "public", "uploads", "tmp");
    await mkdir(tempDir, { recursive: true });
    await writeFile(path.join(tempDir, `${uploadToken}.pdf`), buffer);
  }

  return NextResponse.json({
    uploadToken,
    originalFileName: sanitizeFilename(file.name),
    suggestedTitle: sanitizeFilename(path.parse(filename).name).replace(/-/g, " "),
    startDate: parsed.startDate ? formatDateInIsrael(parsed.startDate) : "",
    expirationDate: parsed.expirationDate ? formatDateInIsrael(parsed.expirationDate) : "",
    monthEntries: monthlyRanges.map((range) => ({
      startDate: formatDateInIsrael(range.startDate),
      expirationDate: formatDateInIsrael(range.expirationDate),
    })),
    confidence: parsed.confidence,
    extractedText,
  });
}
