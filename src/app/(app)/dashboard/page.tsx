import { DashboardAccounting } from "@/components/dashboard/DashboardAccounting";
import { DashboardFinance } from "@/components/dashboard/DashboardFinance";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardPipeline } from "@/components/dashboard/DashboardPipeline";
import { DashboardQuickLinks } from "@/components/dashboard/DashboardQuickLinks";
import { DashboardRecentOrders } from "@/components/dashboard/DashboardRecentOrders";
import { getDashboardStats } from "@/services/work-orders.service";
import { getFinanceStats } from "@/services/finance-stats.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;
  let financeStats: Awaited<ReturnType<typeof getFinanceStats>> | null = null;
  let error: string | null = null;
  try {
    [stats, financeStats] = await Promise.all([
      getDashboardStats(),
      getFinanceStats(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-5 text-sm text-amber-800">
          <p className="font-medium">Sin conexión a la base de datos</p>
          <p className="text-xs font-mono mt-1 opacity-75 break-all">{error}</p>
        </div>
      )}

      <DashboardHero
        activeInShop={stats?.activeInShop ?? 0}
        totalOrders={stats?.totalOrders ?? 0}
      />

      <DashboardPipeline
        received={stats?.receivedOrders ?? 0}
        inProgress={stats?.inProgressOrders ?? 0}
        completed={stats?.completedOrders ?? 0}
        delivered={stats?.deliveredOrders ?? 0}
      />

      {financeStats && (
        <div className="mb-6">
          <DashboardAccounting stats={financeStats} />
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-5">
        <DashboardRecentOrders orders={stats?.recentOrders ?? []} />

        <aside className="space-y-4">
          <DashboardFinance
            totalMaterials={stats?.totalMaterials ?? 0}
            totalLaborAmount={stats?.totalLaborAmount ?? 0}
            totalLaborPieces={stats?.totalLaborPieces ?? 0}
          />
          <div className="card p-3">
            <DashboardQuickLinks />
          </div>
        </aside>
      </div>
    </>
  );
}
