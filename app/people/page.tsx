import { format } from "date-fns";

import { addPersonAction, removePersonAction } from "@/app/people/actions";
import { ProtectedPage } from "@/components/layout/protected-page";
import { PersonCard } from "@/components/people/person-card";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MAX_TRACKED_PEOPLE } from "@/lib/constants";
import { getDictionary } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { assertTrackedFamilyIntegrity } from "@/services/family-service";
import { daysUntilExpiration } from "@/utils/date";

export const dynamic = "force-dynamic";

export default async function PeoplePage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  await assertTrackedFamilyIntegrity();
  const params = await searchParams;

  const [{ t }, people] = await Promise.all([
    getDictionary(),
    prisma.person.findMany({ include: { prescriptions: true }, orderBy: { fullName: "asc" } }),
  ]);

  const canAdd = people.length < MAX_TRACKED_PEOPLE;

  return (
    <ProtectedPage>
      <PageHeader title={t.people.title} />

      {params.success === "added" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t.people.addSuccess}</div>
      ) : null}

      {params.success === "removed" ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{t.people.removeSuccess}</div>
      ) : null}

      {params.error ? (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{decodeURIComponent(params.error)}</div>
      ) : null}

      <Card className="mb-5">
        <h2 className="text-base font-semibold text-slate-900">{t.people.manageTitle}</h2>
        <p className="mt-1 text-sm text-slate-500">{t.people.maxReached}</p>

        <form action={addPersonAction} className="mt-4 grid gap-3 md:grid-cols-3">
          <input
            name="fullName"
            placeholder={t.people.fullName}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            required
            disabled={!canAdd}
          />
          <input
            name="note"
            placeholder={t.people.optionalNote}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            disabled={!canAdd}
          />
          <button
            type="submit"
            disabled={!canAdd}
            className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t.people.addPerson}
          </button>
        </form>

        <div className="mt-4 grid gap-2 md:grid-cols-2">
          {people.map((person) => (
            <form key={person.id} action={removePersonAction} className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-2">
              <span className="text-sm text-slate-700">{person.fullName}</span>
              <input type="hidden" name="personId" value={person.id} />
              <button type="submit" className="w-full rounded-md border border-rose-300 px-2 py-2 text-xs font-medium text-rose-700 sm:w-auto sm:py-1">
                {t.people.removePerson}
              </button>
            </form>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => {
          const activeCount = person.prescriptions.filter((prescription) => prescription.status === "active").length;
          const issuedCount = person.prescriptions.filter((prescription) => prescription.status === "issued").length;
          const nearest = person.prescriptions
            .filter((prescription) => prescription.status === "active")
            .sort((a, b) => a.expirationDate.getTime() - b.expirationDate.getTime())[0];

          return (
            <PersonCard
              key={person.id}
              id={person.id}
              name={person.fullName}
              activeCount={activeCount}
              issuedCount={issuedCount}
              nearestExpiration={nearest ? format(nearest.expirationDate, "yyyy-MM-dd") : "-"}
              warning={nearest ? daysUntilExpiration(nearest.expirationDate) <= 7 : false}
              labels={{
                active: t.people.activeCount,
                issued: t.people.issuedCount,
                nearest: t.people.nearestExpiration,
              }}
            />
          );
        })}
      </div>
    </ProtectedPage>
  );
}
