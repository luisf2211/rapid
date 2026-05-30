import { DashboardFinance } from "@/components/dashboard/DashboardFinance";
import { DashboardHero } from "@/components/dashboard/DashboardHero";
import { DashboardPipeline } from "@/components/dashboard/DashboardPipeline";
import { DashboardQuickLinks } from "@/components/dashboard/DashboardQuickLinks";
import { DashboardRecentOrders } from "@/components/dashboard/DashboardRecentOrders";
import { getDashboardStats } from "@/services/work-orders.service";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let stats: Awaited<ReturnType<typeof getDashboardStats>> | null = null;
  let error: string | null = null;
  try {
    stats = await getDashboardStats();
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <div className="-mt-1">
      {error && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 mb-6 text-sm text-amber-900">
          <p className="font-semibold">Sin conexión a la base de datos</p>
          <p className="text-xs font-mono mt-1 opacity-80 break-all">{error}</p>
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

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">
        <DashboardRecentOrders orders={stats?.recentOrders ?? []} />

        <aside className="space-y-6">
          <DashboardFinance
            totalMaterials={stats?.totalMaterials ?? 0}
            totalLabor={stats?.totalLabor ?? 0}
          />
          <div className="card p-4">
            <DashboardQuickLinks />
          </div>
        </aside>
      </div>
    </div>
  );
}
