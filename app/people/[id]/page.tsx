import { notFound } from "next/navigation";

import { deletePrescriptionAction, undoIssuedAction, usePacksAction } from "@/app/actions";
import { ProtectedPage } from "@/components/layout/protected-page";
import { PersonDetailView } from "@/components/people/person-detail-view";
import { prisma } from "@/lib/prisma";
import { formatDateInIsrael } from "@/utils/date";
import { daysUntilIsrael } from "@/utils/israel-time";

export const dynamic = "force-dynamic";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await prisma.person.findUnique({
    where: { id },
    include: {
      prescriptions: {
        orderBy: { expirationDate: "asc" },
      },
    },
  });

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
    daysRemainingValue: daysUntilIsrael(prescription.expirationDate),
    pdfPath: prescription.pdfPath,
    totalPacks: prescription.totalPacks,
    usedPacks: prescription.usedPacks,
  }));

  return (
    <ProtectedPage>
      <PersonDetailView
        person={{ id: person.id, name: person.fullName, note: person.note?.trim() ? person.note : null }}
        rows={rows}
        onUsePacks={usePacksAction}
        onUndoIssued={undoIssuedAction}
        onDelete={deletePrescriptionAction}
      />
    </ProtectedPage>
  );
}
