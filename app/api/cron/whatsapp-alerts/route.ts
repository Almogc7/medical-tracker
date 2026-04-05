import { generateNotificationsForThresholds, sendWhatsAppAlertsIfNeeded } from "@/services/notification-service";
import { syncPrescriptionStatuses } from "@/services/prescription-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await syncPrescriptionStatuses();
  await generateNotificationsForThresholds();
  await sendWhatsAppAlertsIfNeeded();

  return NextResponse.json({ ok: true });
}
