import { usePacksAction } from "@/app/actions";
import { buildDashboardViewModel } from "@/components/dashboard/dashboard-model";
import { DashboardView } from "@/components/dashboard/dashboard-view";
import { ProtectedPage } from "@/components/layout/protected-page";
import { getDashboardData } from "@/services/dashboard-service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <ProtectedPage>
      <DashboardView model={buildDashboardViewModel(data)} onUsePacks={usePacksAction} />
    </ProtectedPage>
  );
}
