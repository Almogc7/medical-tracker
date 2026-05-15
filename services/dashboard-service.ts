import { prisma } from "@/lib/prisma";
import { getReadableDaysRemaining, syncPrescriptionStatuses } from "@/services/prescription-service";
import { daysUntilExpiration } from "@/utils/date";

export async function getDashboardData() {
  await syncPrescriptionStatuses();

  const [
    activeCount,
    issuedCount,
    expiredCount,
    expiringSoonCount,
    upcomingExpirations,
    recentActivity,
    people,
    urgent,
  ] = await Promise.all([
    prisma.prescription.count({ where: { status: "active" } }),
    prisma.prescription.count({ where: { status: "issued" } }),
    prisma.prescription.count({ where: { status: "expired" } }),
    prisma.prescription.count({
      where: {
        status: "active",
        expirationDate: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          gte: new Date(),
        },
      },
    }),
    prisma.prescription.findMany({
      where: { status: "active" },
      include: { person: true },
      orderBy: { expirationDate: "asc" },
      take: 5,
    }),
    prisma.auditLog.findMany({
      include: { prescription: { include: { person: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.person.findMany({
      include: {
        prescriptions: true,
      },
      orderBy: { fullName: "asc" },
    }),
    prisma.prescription.findMany({
      where: {
        status: "active",
        expirationDate: {
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: { person: true },
      orderBy: { expirationDate: "asc" },
    }),
  ]);

  return {
    summary: {
      active: activeCount,
      expiringSoon: expiringSoonCount,
      expired: expiredCount,
      issued: issuedCount,
    },
    upcomingExpirations: upcomingExpirations.map((item) => ({
      id: item.id,
      title: item.title,
      person: item.person.fullName,
      expirationDate: item.expirationDate,
      daysRemaining: getReadableDaysRemaining(item.expirationDate),
      totalPacks: item.totalPacks,
      usedPacks: item.usedPacks,
    })),
    recentActivity: recentActivity.map((activity) => ({
      id: activity.id,
      action: activity.action,
      details: activity.details,
      createdAt: activity.createdAt,
      prescriptionTitle: activity.prescription.title,
      person: activity.prescription.person.fullName,
    })),
    perPerson: people.map((person) => {
      const active = person.prescriptions.filter((prescription) => prescription.status === "active").length;
      const issued = person.prescriptions.filter((prescription) => prescription.status === "issued").length;
      const nearest = person.prescriptions
        .filter((prescription) => prescription.status === "active")
        .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())[0];

      return {
        id: person.id,
        fullName: person.fullName,
        active,
        issued,
        nearestExpiration: nearest?.expirationDate || null,
        hasWarning: nearest ? daysUntilExpiration(nearest.expirationDate) <= 7 : false,
      };
    }),
    urgent: urgent.map((item) => ({
      id: item.id,
      title: item.title,
      person: item.person.fullName,
      daysRemaining: getReadableDaysRemaining(item.expirationDate),
      totalPacks: item.totalPacks,
      usedPacks: item.usedPacks,
    })),
  };
}
