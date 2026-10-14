import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { assertTrackedFamilyIntegrity } from "@/services/family-service";
import { generateNotificationsForThresholds, sendLicenseRenewalAlertsIfNeeded, sendTelegramAlertsIfNeeded } from "@/services/notification-service";
import { syncPrescriptionStatuses } from "@/services/prescription-service";

export async function ProtectedPage({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const localeContext = await getDictionary();

  await assertTrackedFamilyIntegrity();
  await syncPrescriptionStatuses();
  await generateNotificationsForThresholds();
  await sendTelegramAlertsIfNeeded();
  await sendLicenseRenewalAlertsIfNeeded();

  // Read-only: the 5 newest unread for the bell dropdown, plus the true unread total for the badge
  // (the list is capped at 5, so its length alone under-counts).
  const [notifications, unreadTotal] = await Promise.all([
    prisma.notification.findMany({
      where: { isRead: false },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return (
    <AppShell
      localeContext={localeContext}
      unreadNotifications={unreadTotal}
      notificationPreview={notifications.map((notification) => ({
        id: notification.id,
        title: notification.title,
        message: notification.message,
      }))}
      userEmail={session.email}
    >
      {children}
    </AppShell>
  );
}
