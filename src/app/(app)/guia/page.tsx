import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  FileText,
  ClipboardList,
  Wrench,
  Boxes,
  Receipt,
  Package,
  Settings,
} from "lucide-react";

export const dynamic = "force-dynamic";

type Step = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

const steps: Step[] = [
  {
    title: "Cotización",
    description: "Crea el presupuesto, consigue la aprobación e imprime.",
    href: "/quotations",
    icon: FileText,
  },
  {
    title: "Recepción",
    description: "Recibe el vehículo: datos, checklist, daños y fotos.",
    href: "/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Materiales",
    description: "Requisiciones de piezas e insumos; descuentan del inventario.",
    href: "/material-requisitions",
    icon: Boxes,
  },
  {
    title: "Mano de obra",
    description: "Registra trabajo por empleado o externo en cada orden.",
    href: "/labor-orders",
    icon: Wrench,
  },
  {
    title: "Facturación",
    description: "Genera la factura desde la orden, imprime y marca el pago.",
    href: "/invoices",
    icon: Receipt,
  },
];

function StepRow({
  index,
  step,
  isLast,
}: {
  index: number;
  step: Step;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <li className="relative flex gap-5 pb-10 last:pb-0">
      {!isLast && (
        <span
          className="absolute left-[19px] top-10 bottom-0 w-px bg-rapid-border"
          aria-hidden
        />
      )}
      <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rapid-black text-sm font-bold text-white">
        {index}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-rapid-text-muted" strokeWidth={2} />
          <h2 className="text-base font-semibold text-rapid-text">{step.title}</h2>
        </div>
        <p className="mt-1.5 text-sm text-rapid-text-muted leading-relaxed">
          {step.description}
        </p>
        <Link
          href={step.href}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-rapid-text hover:text-rapid-green-dark transition"
        >
          Abrir módulo
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </li>
  );
}

export default function GuiaPage() {
  return (
    <div className="mx-auto max-w-xl pb-12">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-rapid-text">
          Guía rápida
        </h1>
        <p className="mt-2 text-sm text-rapid-text-muted leading-relaxed">
          Sigue estos pasos en orden. Cada módulo del menú corresponde a una
          etapa del trabajo en el taller.
        </p>
      </header>

      <div className="card p-6 sm:p-8 mb-6">
        <p className="text-xs font-medium text-rapid-text-muted mb-6">
          Flujo recomendado
        </p>
        <ol className="list-none m-0 p-0">
          {steps.map((step, i) => (
            <StepRow
              key={step.title}
              index={i + 1}
              step={step}
              isLast={i === steps.length - 1}
            />
          ))}
        </ol>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        <div className="rounded-xl border border-rapid-border bg-rapid-surface px-5 py-4 flex gap-4 items-start">
          <Package className="h-5 w-5 shrink-0 text-rapid-text-muted mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-rapid-text">Inventario</p>
            <p className="text-sm text-rapid-text-muted mt-0.5">
              Catálogo y stock. Las requisiciones descuentan piezas solas.
            </p>
            <Link
              href="/inventory"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rapid-text hover:text-rapid-green-dark transition"
            >
              Ver inventario
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
        <div className="rounded-xl border border-rapid-border bg-rapid-surface px-5 py-4 flex gap-4 items-start">
          <Settings className="h-5 w-5 shrink-0 text-rapid-text-muted mt-0.5" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-rapid-text">Configuración</p>
            <p className="text-sm text-rapid-text-muted mt-0.5">
              Logo, RNC y pies de página para cotizaciones y facturas.
            </p>
            <Link
              href="/settings"
              className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rapid-text hover:text-rapid-green-dark transition"
            >
              Ajustes del taller
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href="/quotations/new" className="btn-primary flex-1 justify-center">
          Nueva cotización
        </Link>
        <Link
          href="/work-orders/new"
          className="btn-secondary flex-1 justify-center"
        >
          Nueva orden
        </Link>
      </div>
    </div>
  );
}
