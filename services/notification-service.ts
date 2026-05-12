import { EXPIRATION_THRESHOLDS, TELEGRAM_ALERT_THRESHOLD_DAYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";
import type { NotificationSeverity } from "@/types/domain";
import { daysUntilExpiration, isExpired, matchesThreshold } from "@/utils/date";

function buildSeverity(days: number) {
  if (days <= 1) {
    return "critical" satisfies NotificationSeverity;
  }

  if (days <= 7) {
    return "high" satisfies NotificationSeverity;
  }

  if (days <= 14) {
    return "medium" satisfies NotificationSeverity;
  }

  return "low" satisfies NotificationSeverity;
}

export async function generateNotificationsForThresholds() {
  const prescriptions = await prisma.prescription.findMany({
    where: {
      status: "active",
    },
    include: {
      person: true,
    },
  });

  const now = new Date();

  for (const prescription of prescriptions) {
    if (isExpired(prescription.expirationDate, now)) {
      await prisma.notification.upsert({
        where: {
          prescriptionId_type: {
            prescriptionId: prescription.id,
            type: "expired",
          },
        },
        update: {},
        create: {
          prescriptionId: prescription.id,
          type: "expired",
          title: "Prescription expired",
          message: `${prescription.title} for ${prescription.person.fullName} has expired.`,
          severity: "critical",
          scheduledFor: now,
        },
      });

      continue;
    }

    const daysRemaining = daysUntilExpiration(prescription.expirationDate, now);

    for (const threshold of EXPIRATION_THRESHOLDS) {
      if (!matchesThreshold(prescription.expirationDate, threshold, now)) {
        continue;
      }

      await prisma.notification.upsert({
        where: {
          prescriptionId_type: {
            prescriptionId: prescription.id,
            type: `expiring_${threshold}d`,
          },
        },
        update: {},
        create: {
          prescriptionId: prescription.id,
          type: `expiring_${threshold}d`,
          title: `Prescription expires in ${daysRemaining} day(s)`,
          message: `${prescription.title} for ${prescription.person.fullName} expires in ${daysRemaining} day(s).`,
          severity: buildSeverity(daysRemaining),
          scheduledFor: now,
        },
      });
    }
  }
}

export async function unreadNotificationCount() {
  return prisma.notification.count({ where: { isRead: false } });
}

type SendTelegramOptions = {
  thresholdDays?: number;
};

export async function sendTelegramAlertsIfNeeded(options?: SendTelegramOptions): Promise<void> {
  const configured =
    process.env.TELEGRAM_BOT_TOKEN &&
    process.env.TELEGRAM_CHAT_ID;

  if (!configured) {
    return;
  }

  const thresholds = options?.thresholdDays != null
    ? [options.thresholdDays]
    : TELEGRAM_ALERT_THRESHOLD_DAYS;

  for (const thresholdDays of thresholds) {
    const notificationType = `expiring_${thresholdDays}d`;

    const pending = await prisma.notification.findMany({
      where: {
        type: notificationType,
        telegramSentAt: null,
      },
      include: {
        prescription: {
          include: { person: true },
        },
      },
    });

    for (const notification of pending) {
      try {
        const { title, person } = notification.prescription;
        await sendTelegramMessage(
          `Prescription Alert: "${title}" for ${person.fullName} expires in ${thresholdDays} days. Please take action.`,
        );
        await prisma.notification.update({
          where: { id: notification.id },
          data: { telegramSentAt: new Date() },
        });
      } catch (error) {
        console.error(
          `Telegram alert failed for notification ${notification.id}:`,
          error,
        );
      }
    }
  }
}
