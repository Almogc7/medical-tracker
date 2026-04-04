import { mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";
import { z } from "zod";

import { getApiSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ensureTrackedPersonExists } from "@/services/family-service";
import { autoStatusUpdate, parseIsraelDateInput } from "@/utils/date";
import { generateStoredFilename } from "@/utils/files";

const monthEntrySchema = z.object({
  startDate: z.string().min(1),
  expirationDate: z.string().min(1),
  title: z.string().optional(),
});

const payloadSchema = z.object({
  personId: z.string().min(1),
  baseTitle: z.string().min(1),
  notes: z.string().optional(),
  uploadToken: z.string().min(1),
  originalFileName: z.string().min(1),
  extractedText: z.string().optional(),
  monthEntries: z.array(monthEntrySchema).min(1),
});

export async function POST(request: Request) {
  const session = await getApiSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = payloadSchema.safeParse(body);

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

  const created = await prisma.$transaction(
    data.monthEntries.map((entry, index) => {
      const title = entry.title?.trim() || `${data.baseTitle} - Month ${index + 1}`;
      const startDate = parseIsraelDateInput(entry.startDate);
      const expirationDate = parseIsraelDateInput(entry.expirationDate);

      return prisma.prescription.create({
        data: {
          personId: data.personId,
          title,
          notes: data.notes,
          startDate,
          expirationDate,
          pdfPath,
          originalFileName: data.originalFileName,
          extractedText: data.extractedText,
          status: autoStatusUpdate({
            expirationDate,
            currentStatus: "active",
            issuedAt: null,
          }),
        },
      });
    }),
  );

  await prisma.auditLog.createMany({
    data: created.map((item) => ({
      prescriptionId: item.id,
      action: "created",
      details: "Prescription month created via bulk upload",
    })),
  });

  return NextResponse.json({ ok: true, count: created.length });
}
