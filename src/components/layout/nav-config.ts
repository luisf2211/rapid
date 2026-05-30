import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  Receipt,
  Boxes,
  Wrench,
  Package,
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
      {
        href: "/inventory",
        label: "Inventario",
        icon: Package,
        stockAlerts: true,
      },
    ],
  },
];

export function isNavActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(`${href}/`);
}
