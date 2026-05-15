import Link from "next/link";
import { notFound } from "next/navigation";

import { PersonDetailClient } from "@/components/people/person-detail-client";
import { ProtectedPage } from "@/components/layout/protected-page";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getReadableDaysRemaining } from "@/services/prescription-service";
import { daysUntilExpiration, formatDateInIsrael } from "@/utils/date";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ t }, person] = await Promise.all([
    getDictionary(),
    prisma.person.findUnique({
      where: { id },
      include: {
        prescriptions: {
          orderBy: { expirationDate: "asc" },
        },
      },
    }),
  ]);

  if (!person) {
    notFound();
  }

  const rows = person.prescriptions.map((prescription) => ({
    id: prescription.id,
    title: prescription.title,
    status: prescription.status,
    startDate: formatDateInIsrael(prescription.startDate),
    expirationDate: formatDateInIsrael(prescription.expirationDate),
    expirationDateValue: prescription.expirationDate.toISOString(),
    daysRemainingValue: daysUntilExpiration(prescription.expirationDate),
    daysRemaining: getReadableDaysRemaining(prescription.expirationDate),
    pdfPath: prescription.pdfPath,
    totalPacks: prescription.totalPacks,
    usedPacks: prescription.usedPacks,
  }));

  return (
    <ProtectedPage>
      <PageHeader
        title={person.fullName}
        subtitle={t.person.prescriptions}
        actions={
          <Link href="/upload" className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">
            {t.common.uploadPrescription}
          </Link>
        }
      />
      <PersonDetailClient rows={rows} />
    </ProtectedPage>
  );
}
