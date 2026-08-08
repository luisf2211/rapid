import { AppSidebar } from "@/components/layout/AppSidebar";
import { MobileTopBar } from "@/components/layout/MobileTopBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { StockAlertsBanner } from "@/components/layout/StockAlertsBanner";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import { getInventoryStockAlerts } from "@/services/inventory.service";
import { getWorkshopSettings } from "@/services/workshop-settings.service";
import { requireCompanySession } from "@/lib/auth/guards";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireCompanySession();
  let stockAlerts: Awaited<ReturnType<typeof getInventoryStockAlerts>> = {
    alerts: [],
    total: 0,
  };
  try {
    stockAlerts = await getInventoryStockAlerts();
  } catch {
    /* sin tablas de inventario */
  }

  let workshop: { businessName: string | null; logoUrl: string | null } = {
    businessName: null,
    logoUrl: null,
  };
  try {
    const settings = await getWorkshopSettings();
    if (settings) {
      workshop = {
        businessName: settings.businessName,
        logoUrl: settings.logoUrl,
      };
    }
  } catch {
    /* sin settings */
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex bg-rapid-bg">
        <AppSidebar
          alerts={stockAlerts.alerts}
          total={stockAlerts.total}
          session={{
            email: session.email,
            fullName: session.fullName,
            companyName: session.companyName,
          }}
          workshop={workshop}
        />
        <div className="flex-1 flex flex-col min-w-0">
          <MobileTopBar
            stockAlertCount={stockAlerts.total}
            workshop={workshop}
          />
          <StockAlertsBanner
            alerts={stockAlerts.alerts}
            total={stockAlerts.total}
          />
          <main className="flex-1 px-4 sm:px-6 lg:px-8 py-5 lg:py-6 pb-28 lg:pb-8 max-w-[1280px] w-full mx-auto">
            {children}
          </main>
          <MobileBottomNav stockAlertCount={stockAlerts.total} />
        </div>
      </div>
    </SidebarProvider>
  );
}
