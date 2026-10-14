import { setAllPacksForPersonAction } from "@/app/actions";
import { addPersonAction, removePersonAction } from "@/app/people/actions";
import { ProtectedPage } from "@/components/layout/protected-page";
import { buildPeopleViewModel } from "@/components/people/people-model";
import { PeopleView, type PeopleFeedback } from "@/components/people/people-view";
import { MAX_TRACKED_PEOPLE } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { assertTrackedFamilyIntegrity } from "@/services/family-service";

export const dynamic = "force-dynamic";

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await assertTrackedFamilyIntegrity();
  const params = await searchParams;

  const people = await prisma.person.findMany({ include: { prescriptions: true }, orderBy: { fullName: "asc" } });

  const feedback: PeopleFeedback = {
    success: params.success === "added" || params.success === "removed" ? params.success : undefined,
    error: params.error ? safeDecode(params.error) : undefined,
  };

  return (
    <ProtectedPage>
      <PeopleView
        people={buildPeopleViewModel(people)}
        canAdd={people.length < MAX_TRACKED_PEOPLE}
        max={MAX_TRACKED_PEOPLE}
        feedback={feedback}
        addAction={addPersonAction}
        removeAction={removePersonAction}
        onSetAllPacks={setAllPacksForPersonAction}
      />
    </ProtectedPage>
  );
}
