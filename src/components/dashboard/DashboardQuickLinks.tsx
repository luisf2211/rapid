import Link from "next/link";
import {
  ClipboardList,
  FileText,
  Receipt,
  Package,
  ChevronRight,
} from "lucide-react";

const links = [
  {
    href: "/quotations",
    label: "Cotizaciones",
    desc: "Presupuestos y aprobaciones",
    icon: FileText,
  },
  {
    href: "/work-orders",
    label: "Recepción",
    desc: "Órdenes y checklist",
    icon: ClipboardList,
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
      <h2 className="font-bold text-rapid-text mb-3">Accesos</h2>
      <ul className="space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-rapid-bg transition"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rapid-bg group-hover:bg-white border border-rapid-border transition">
                  <Icon className="w-4 h-4 text-rapid-text-muted group-hover:text-rapid-text" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-rapid-text">
                    {item.label}
                  </span>
                  <span className="block text-xs text-rapid-text-muted truncate">
                    {item.desc}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-rapid-text-muted/50 group-hover:text-rapid-text shrink-0" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
