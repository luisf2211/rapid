import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Receipt,
  Package,
  Wrench,
  Boxes,
  ChevronRight,
} from "lucide-react";

const links = [
  {
    href: "/quotations",
    label: "Cotizaciones",
    desc: "Presupuestos",
    icon: FileText,
  },
  {
    href: "/work-orders",
    label: "Recepción",
    desc: "Órdenes y checklist",
    icon: ClipboardList,
  },
  {
    href: "/labor-orders",
    label: "Mano de obra",
    desc: "Registro por orden",
    icon: Wrench,
  },
  {
    href: "/material-requisitions",
    label: "Materiales",
    desc: "Requisiciones",
    icon: Boxes,
  },
  {
    href: "/invoices",
    label: "Facturación",
    desc: "Generar y cobrar",
    icon: Receipt,
  },
  {
    href: "/inventory",
    label: "Inventario",
    desc: "Stock y alertas",
    icon: Package,
  },
] as const;

export function DashboardQuickLinks() {
  return (
    <section>
      <h2 className="text-sm font-semibold text-rapid-text mb-2">Accesos rápidos</h2>
      <ul className="space-y-0.5">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-rapid-surface-soft transition-colors"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rapid-surface-strong group-hover:bg-white border border-rapid-border transition-colors">
                  <Icon className="w-3.5 h-3.5 text-rapid-text-muted group-hover:text-rapid-text" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-medium text-rapid-text">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-rapid-text-muted truncate">
                    {item.desc}
                  </span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-rapid-text-muted-soft group-hover:text-rapid-text-muted shrink-0 transition-colors" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
