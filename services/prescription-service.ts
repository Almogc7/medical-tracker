import { EXPIRATION_THRESHOLDS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import type { PrescriptionStatus } from "@/types/domain";
import { autoStatusUpdate, daysUntilExpiration, isExpiringSoon, matchesThreshold } from "@/utils/date";

export type FilterStatus = "all" | PrescriptionStatus | "expiring_soon";

export async function syncPrescriptionStatuses() {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      status: {
        in: ["active", "expired"],
      },
    },
  });

  const updates = prescriptions
    .map((prescription) => ({
      id: prescription.id,
      status: autoStatusUpdate({
        expirationDate: prescription.expirationDate,
        currentStatus: prescription.status,
        issuedAt: prescription.issuedAt,
      }),
    }))
    .filter((item, index) => item.status !== prescriptions[index].status);

  if (!updates.length) {
    return;
  }

  await prisma.$transaction(
    updates.map((update) =>
      prisma.prescription.update({
        where: { id: update.id },
        data: { status: update.status },
      }),
    ),
  );
}

export async function usePrescriptionPacks(prescriptionId: string, packsToUse: number) {
  const prescription = await prisma.prescription.findUniqueOrThrow({
    where: { id: prescriptionId },
  });

  const remaining = prescription.totalPacks - prescription.usedPacks;
  const clamped = Math.min(packsToUse, remaining);
  const newUsed = prescription.usedPacks + clamped;
  const fullyUsed = newUsed >= prescription.totalPacks;

  const updated = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      usedPacks: newUsed,
      ...(fullyUsed ? { status: "issued", issuedAt: new Date() } : {}),
    },
  });

  const newRemaining = prescription.totalPacks - newUsed;
  await prisma.auditLog.create({
    data: {
      prescriptionId,
      action: "used_packs",
      details: `Used ${clamped} pack(s). ${newRemaining} remaining.`,
    },
  });

  return updated;
}

export async function undoPrescriptionIssued(prescriptionId: string) {
  const prescription = await prisma.prescription.findUniqueOrThrow({
    where: { id: prescriptionId },
  });

  const status = autoStatusUpdate({
    expirationDate: prescription.expirationDate,
    currentStatus: "active",
    issuedAt: null,
  });

  const updated = await prisma.prescription.update({
    where: { id: prescriptionId },
    data: {
      status,
      issuedAt: null,
      usedPacks: 0,
    },
  });

  await prisma.auditLog.create({
    data: {
      prescriptionId,
      action: "undo_issued",
      details: "Prescription issuance reverted",
    },
  });

  return updated;
}

export async function deletePrescription(prescriptionId: string) {
  await prisma.auditLog.create({
    data: {
      prescriptionId,
      action: "deleted",
      details: "Prescription deleted by owner",
    },
  });

  await prisma.prescription.delete({
    where: { id: prescriptionId },
  });
}

export function isPrescriptionUrgent(expirationDate: Date, status: PrescriptionStatus) {
  return status === "active" && isExpiringSoon(expirationDate, 7);
}

export function shouldCreateThresholdReminder(expirationDate: Date, status: PrescriptionStatus) {
  if (status !== "active") {
    return false;
  }

  return EXPIRATION_THRESHOLDS.some((threshold) => matchesThreshold(expirationDate, threshold));
}

export function getReadableDaysRemaining(expirationDate: Date) {
  const days = daysUntilExpiration(expirationDate);
  if (days < 0) {
    return `${Math.abs(days)} days ago`;
  }

  if (days === 0) {
    return "Today";
  }

  return `${days} days`;
}
