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

      {/* Compact stats strip — replaces 4 identical hero-metric cards */}
      <div className="mb-5 flex divide-x divide-border overflow-x-auto rounded-xl border border-border bg-surface">
        <SummaryCard label={t.dashboard.summary.active} value={data.summary.active} tone="green" />
        <SummaryCard label={t.dashboard.summary.expiringSoon} value={data.summary.expiringSoon} tone="amber" />
        <SummaryCard label={t.dashboard.summary.expired} value={data.summary.expired} tone="red" />
        <SummaryCard label={t.dashboard.summary.issued} value={data.summary.issued} tone="gray" />
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t.dashboard.upcomingExpirations}</h2>
          <div className="mt-3">
            {data.upcomingExpirations.length ? (
              <IssuableList items={data.upcomingExpirations} />
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.upcomingExpirations} />
            )}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t.dashboard.urgentAlerts}</h2>
          <div className="mt-3">
            {data.urgent.length ? (
              <IssuableList items={data.urgent} urgent />
            ) : (
              <EmptyState title={t.common.empty} message={t.dashboard.urgentAlerts} />
            )}
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t.dashboard.perPerson}</h2>
          <div className="mt-3 divide-y divide-border-subtle">
            {data.perPerson.map((person) => (
              <div key={person.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{person.fullName}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {t.people.activeCount}: {person.active} · {t.people.issuedCount}: {person.issued}
                  </p>
                </div>
                <p className="flex-shrink-0 text-xs tabular-nums text-slate-400">
                  {person.nearestExpiration ? format(person.nearestExpiration, "yyyy-MM-dd") : "—"}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">{t.dashboard.recentActivity}</h2>
          <div className="mt-3 divide-y divide-border-subtle">
            {data.recentActivity.length ? (
              data.recentActivity.map((item) => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0">
                  <p className="text-sm font-medium text-slate-900">{item.prescriptionTitle}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.person} · {item.action}
                  </p>
                  <p className="mt-0.5 text-xs tabular-nums text-slate-400">
                    {format(item.createdAt, "yyyy-MM-dd HH:mm")}
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
