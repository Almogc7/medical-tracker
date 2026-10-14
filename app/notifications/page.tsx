import { ProtectedPage } from "@/components/layout/protected-page";
import { NotificationList } from "@/components/notifications/notification-list";
import { toNotificationItems } from "@/components/notifications/notifications-model";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <ProtectedPage>
      <NotificationList items={toNotificationItems(notifications)} />
    </ProtectedPage>
  );
}
