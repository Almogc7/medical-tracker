import { notFound } from "next/navigation";

import { updateTotalPacksAction } from "@/app/actions";
import { ProtectedPage } from "@/components/layout/protected-page";
import { PrescriptionDetailView } from "@/components/prescriptions/prescription-detail-view";
import { prisma } from "@/lib/prisma";
import { formatDateInIsrael } from "@/utils/date";
import { daysUntilIsrael } from "@/utils/israel-time";

export const dynamic = "force-dynamic";

export default async function PrescriptionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const prescription = await prisma.prescription.findUnique({
    where: { id },
    include: { person: true },
  });

  if (!prescription) {
    notFound();
  }

  return (
    <ProtectedPage>
      <PrescriptionDetailView
        prescription={{
          id: prescription.id,
          title: prescription.title,
          status: prescription.status,
          personId: prescription.person.id,
          personName: prescription.person.fullName,
          startDate: formatDateInIsrael(prescription.startDate),
          expirationDate: formatDateInIsrael(prescription.expirationDate),
          expirationDateValue: prescription.expirationDate.toISOString(),
          daysRemainingValue: daysUntilIsrael(prescription.expirationDate),
          totalPacks: prescription.totalPacks,
          usedPacks: prescription.usedPacks,
          notes: prescription.notes,
          pdfPath: prescription.pdfPath,
        }}
        onSaveTotalPacks={updateTotalPacksAction}
      />
    </ProtectedPage>
  );
}
