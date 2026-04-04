import { mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureTrackedPersonExists } from "@/services/family-service";
import { generateStoredFilename } from "@/utils/files";
import { autoStatusUpdate, parseIsraelDateInput } from "@/utils/date";

const payloadSchema = z.object({
  personId: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  startDate: z.string().min(1),
  expirationDate: z.string().min(1),
  uploadToken: z.string().min(1),
  originalFileName: z.string().min(1),
  extractedText: z.string().optional(),
});

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json();
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data = parsed.data;

  try {
    await ensureTrackedPersonExists(data.personId);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid person" }, { status: 400 });
  }

  const isBlobUpload = /^https?:\/\//i.test(data.uploadToken);

  let pdfPath: string;
  if (isBlobUpload) {
    pdfPath = data.uploadToken;
  } else {
    const tempPath = path.join(process.cwd(), "public", "uploads", "tmp", `${data.uploadToken}.pdf`);

    try {
      await stat(tempPath);
    } catch {
      return NextResponse.json({ error: "Upload token not found" }, { status: 400 });
    }

    const finalName = generateStoredFilename(data.originalFileName);
    const finalDir = path.join(process.cwd(), "public", "uploads", "prescriptions");
    await mkdir(finalDir, { recursive: true });
    const finalPath = path.join(finalDir, finalName);

    await rename(tempPath, finalPath);
    pdfPath = `uploads/prescriptions/${finalName}`;
  }

  const startDate = parseIsraelDateInput(data.startDate);
  const expirationDate = parseIsraelDateInput(data.expirationDate);

  const status = autoStatusUpdate({
    expirationDate,
    currentStatus: "active",
    issuedAt: null,
  });

  const created = await prisma.prescription.create({
    data: {
      personId: data.personId,
      title: data.title,
      notes: data.notes,
      startDate,
      expirationDate,
      pdfPath,
      originalFileName: data.originalFileName,
      extractedText: data.extractedText,
      status,
    },
  });

  await prisma.auditLog.create({
    data: {
      prescriptionId: created.id,
      action: "created",
      details: "Prescription created via upload",
    },
  });

  return NextResponse.json({ ok: true, id: created.id });
}
