import Link from "next/link";
import { notFound } from "next/navigation";

import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getReadableDaysRemaining } from "@/services/prescription-service";
import { formatDateInIsrael } from "@/utils/date";
import { resolvePdfHref } from "@/utils/pdf-path";

export const dynamic = "force-dynamic";

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [{ t }, prescription] = await Promise.all([
    getDictionary(),
    (async () => {
      const { id } = await params;
      return prisma.prescription.findUnique({
        where: { id },
        include: { person: true },
      });
    })(),
  ]);

  if (!prescription) {
    notFound();
  }

  return (
    <ProtectedPage>
      <PageHeader
        title={prescription.title}
        subtitle={t.prescriptions.detail}
        actions={
          <Link href="/people" className="inline-block text-sm text-slate-600 underline">
            {t.common.back}
          </Link>
        }
      />
      <Card className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600">{prescription.person.fullName}</p>
          <StatusBadge status={prescription.status} expirationDate={prescription.expirationDate} />
        </div>
        <p className="text-sm text-slate-700">{t.common.startsOn}: {formatDateInIsrael(prescription.startDate)}</p>
        <p className="text-sm text-slate-700">{t.common.expiresOn}: {formatDateInIsrael(prescription.expirationDate)}</p>
        <p className="text-sm text-slate-700">{t.common.daysRemaining}: {getReadableDaysRemaining(prescription.expirationDate)}</p>
        <p className="text-sm text-slate-700">{t.common.notes}: {prescription.notes || "-"}</p>
        <div className="pt-2">
          <Link
            href={resolvePdfHref(prescription.pdfPath)}
            target="_blank"
            className="inline-flex w-full justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 sm:w-auto"
          >
            {t.common.viewPdf}
          </Link>
        </div>
      </Card>
    </ProtectedPage>
  );
}
