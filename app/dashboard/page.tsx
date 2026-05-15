import { format } from "date-fns";

import { IssuableList } from "@/components/dashboard/issuable-list";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ProtectedPage } from "@/components/layout/protected-page";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { getDictionary } from "@/lib/i18n";
import { getDashboardData } from "@/services/dashboard-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [{ t }, data] = await Promise.all([getDictionary(), getDashboardData()]);

  return (
    <ProtectedPage>
      <PageHeader title={t.dashboard.title} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label={t.dashboard.summary.active} value={data.summary.active} tone="green" />
        <SummaryCard label={t.dashboard.summary.expiringSoon} value={data.summary.expiringSoon} tone="amber" />
        <SummaryCard label={t.dashboard.summary.expired} value={data.summary.expired} tone="red" />
        <SummaryCard label={t.dashboard.summary.issued} value={data.summary.issued} tone="gray" />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">{t.dashboard.upcomingExpirations}</h2>
          <div className="mt-3">
            {data.upcomingExpirations.length ? (
              <IssuableList items={data.upcomingExpirations} />
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.upcomingExpirations} />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">{t.dashboard.urgentAlerts}</h2>
          <div className="mt-3">
            {data.urgent.length ? (
              <IssuableList items={data.urgent} urgent />
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.urgentAlerts} />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">{t.dashboard.perPerson}</h2>
          <div className="mt-3 space-y-2">
            {data.perPerson.map((person) => (
              <div key={person.id} className="rounded-xl border border-slate-200 p-3">
                <p className="font-medium text-slate-900">{person.fullName}</p>
                <p className="text-sm text-slate-600">
                  {t.people.activeCount}: {person.active} | {t.people.issuedCount}: {person.issued}
                </p>
                <p className="text-xs text-slate-500">
                  {t.people.nearestExpiration}: {person.nearestExpiration ? format(person.nearestExpiration, "yyyy-MM-dd") : "-"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-slate-900">{t.dashboard.recentActivity}</h2>
          <div className="mt-3 space-y-2">
            {data.recentActivity.length ? (
              data.recentActivity.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-3">
                  <p className="font-medium text-slate-900">{item.action}</p>
                  <p className="text-sm text-slate-600">{item.prescriptionTitle}</p>
                  <p className="text-xs text-slate-500">
                    {item.person} • {format(item.createdAt, "yyyy-MM-dd HH:mm")}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.recentActivity} />
            )}
          </div>
        </Card>
      </div>
    </ProtectedPage>
  );
}
