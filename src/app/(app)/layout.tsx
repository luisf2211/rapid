import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { StockAlertsBanner } from "@/components/layout/StockAlertsBanner";
import { getInventoryStockAlerts } from "@/services/inventory.service";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let stockAlerts: Awaited<ReturnType<typeof getInventoryStockAlerts>> = {
    alerts: [],
    total: 0,
  };
  try {
    stockAlerts = await getInventoryStockAlerts();
  } catch {
    /* sin tablas de inventario */
  }

  return (
    <div className="min-h-screen flex bg-rapid-bg">
      <AppSidebar alerts={stockAlerts.alerts} total={stockAlerts.total} />
      <div className="flex-1 flex flex-col min-w-0">
        <MobileTopBar stockAlertCount={stockAlerts.total} />
        <StockAlertsBanner
          alerts={stockAlerts.alerts}
          total={stockAlerts.total}
        />
        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 lg:py-8 pb-24 lg:pb-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
        <MobileBottomNav stockAlertCount={stockAlerts.total} />
      </div>
    </div>
  );
}
