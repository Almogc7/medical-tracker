import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { assertTrackedFamilyIntegrity } from "@/services/family-service";
import { generateNotificationsForThresholds, sendTelegramAlertsIfNeeded } from "@/services/notification-service";
import { syncPrescriptionStatuses } from "@/services/prescription-service";

export async function ProtectedPage({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const localeContext = await getDictionary();

  await assertTrackedFamilyIntegrity();
  await syncPrescriptionStatuses();
  await generateNotificationsForThresholds();
  await sendTelegramAlertsIfNeeded();

  const notifications = await prisma.notification.findMany({
    where: { isRead: false },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <AppShell
      localeContext={localeContext}
      unreadNotifications={notifications.length}
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
