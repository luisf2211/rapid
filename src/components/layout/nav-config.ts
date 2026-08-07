import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Receipt,
  Boxes,
  Wrench,
  Droplets,
  Package,
  Settings,
  Users,
  Wallet,
  TrendingDown,
  Landmark,
  Coins,
  Shield,
  Building2,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  stockAlerts?: boolean;
};

export type NavGroup = {
  label: string;
  items: NavItem[];
};

export const sidebarNavGroups: NavGroup[] = [
  {
    label: "Inicio",
    items: [
      { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
      { href: "/quotations", label: "Cotizaciones", icon: FileText },
    ],
  },
  {
    label: "Recepción",
    items: [
      { href: "/work-orders", label: "Órdenes", icon: ClipboardList },
      { href: "/material-requisitions", label: "Materiales", icon: Boxes },
      { href: "/labor-orders", label: "Mano de obra", icon: Wrench },
    ],
  },
  {
    label: "Gestión",
    items: [
      { href: "/invoices", label: "Facturación", icon: Receipt },
      { href: "/employees", label: "Empleados", icon: Users },
      { href: "/payments", label: "Pagos", icon: Wallet },
      {
        href: "/inventory",
        label: "Inventario",
        icon: Package,
        stockAlerts: true,
      },
      { href: "/inventory/paint", label: "Pintura", icon: Droplets },
      { href: "/settings/insurance-companies", label: "Aseguradoras", icon: Building2 },
    ],
  },
  {
    label: "Finanzas",
    items: [
      { href: "/expenses", label: "Gastos", icon: TrendingDown },
      { href: "/petty-cash", label: "Caja chica", icon: Coins },
      { href: "/banks", label: "Bancos", icon: Landmark },
    ],
  },
  {
    label: "Sistema",
    items: [
      { href: "/users", label: "Usuarios", icon: Shield },
      { href: "/settings", label: "Configuración", icon: Settings },
    ],
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/inventory") {
    return (
      pathname.startsWith("/inventory/") &&
      !pathname.startsWith("/inventory/paint")
    );
  }
  return pathname.startsWith(`${href}/`);
}
