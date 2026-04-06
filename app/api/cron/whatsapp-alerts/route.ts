import { generateNotificationsForThresholds, sendWhatsAppAlertsIfNeeded } from "@/services/notification-service";
import { syncPrescriptionStatuses } from "@/services/prescription-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const thresholdParam = url.searchParams.get("whatsappThresholdDays");
  let parsedThreshold: number | undefined;

  if (thresholdParam !== null) {
    const candidate = Number.parseInt(thresholdParam, 10);
    if (!Number.isFinite(candidate) || candidate <= 0) {
      return NextResponse.json({ error: "Invalid whatsappThresholdDays" }, { status: 400 });
    }
    parsedThreshold = candidate;
  }

  await syncPrescriptionStatuses();
  await generateNotificationsForThresholds();
  await sendWhatsAppAlertsIfNeeded({ thresholdDays: parsedThreshold });

  return NextResponse.json({ ok: true, whatsappThresholdDays: parsedThreshold ?? null });
}
