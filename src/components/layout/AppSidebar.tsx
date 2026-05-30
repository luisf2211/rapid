import type { InventoryStockAlert } from "@/lib/inventory/alerts";
import { Logo } from "./Logo";
import { SidebarNav } from "./SidebarNav";
import { SidebarStockAlerts } from "./SidebarStockAlerts";

interface Props {
  alerts: InventoryStockAlert[];
  total: number;
}

export function AppSidebar({ alerts, total }: Props) {
  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-rapid-black text-white">
      <div className="px-5 py-5 border-b border-white/5">
        <Logo variant="dark" />
      </div>
      <SidebarNav stockAlertCount={total} />
      <SidebarStockAlerts alerts={alerts} total={total} />
    </aside>
  );
}
