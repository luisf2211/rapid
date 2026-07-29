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
  TrendingDown,
  Coins,
  Landmark,
  Shield,
  MessageCircle,
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
    description:
      "Crea el presupuesto para el cliente (particular o aseguradora), agrega mano de obra y repuestos, consigue la aprobación e imprime.",
    href: "/quotations",
    icon: FileText,
  },
  {
    title: "Recepción del vehículo",
    description:
      "Recibe el vehículo: datos del cliente, checklist completo (alfombras, radar, cámara, etc.), marca daños en el diagrama, fotos y firma digital.",
    href: "/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Requisición de materiales",
    description:
      "Solicita piezas e insumos del inventario. Se descuentan automáticamente del stock y se asignan al empleado responsable.",
    href: "/material-requisitions",
    icon: Boxes,
  },
  {
    title: "Mano de obra",
    description:
      "Registra el trabajo por empleado o externo en cada orden: desabollado, preparación, pintura, brillo. Se calcula el pago por pieza.",
    href: "/labor-orders",
    icon: Wrench,
  },
  {
    title: "Facturación",
    description:
      "Genera la factura desde la orden con todas las líneas de mano de obra y materiales. Imprime, marca el pago y envía por WhatsApp o correo.",
    href: "/invoices",
    icon: Receipt,
  },
];

type ModuleCard = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  linkLabel: string;
};

const modules: ModuleCard[] = [
  {
    title: "Inventario",
    description:
      "Catálogo de materiales y pintura con stock, alertas de bajo nivel y movimientos automáticos por requisición.",
    href: "/inventory",
    icon: Package,
    linkLabel: "Ver inventario",
  },
  {
    title: "Gastos",
    description:
      "Registra gastos operativos del taller: comida, combustible, suministros, herramientas. Categorizados y con método de pago.",
    href: "/expenses",
    icon: TrendingDown,
    linkLabel: "Ver gastos",
  },
  {
    title: "Caja chica",
    description:
      "Fondos fijos para gastos menores del día a día. Controla desembolsos, reposiciones y el balance disponible.",
    href: "/petty-cash",
    icon: Coins,
    linkLabel: "Ver caja chica",
  },
  {
    title: "Bancos",
    description:
      "Registra las cuentas bancarias del taller, controla el balance y lleva un historial de transacciones.",
    href: "/banks",
    icon: Landmark,
    linkLabel: "Ver bancos",
  },
  {
    title: "Usuarios y permisos",
    description:
      "Crea usuarios para tu equipo y asigna a qué módulos puede acceder cada uno.",
    href: "/users",
    icon: Shield,
    linkLabel: "Gestionar usuarios",
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
    <div className="mx-auto max-w-2xl pb-12">
      <header className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-rapid-text">
          Guía de uso del sistema
        </h1>
        <p className="mt-2 text-sm text-rapid-text-muted leading-relaxed max-w-xl">
          Este sistema gestiona todo el flujo de trabajo de tu taller: desde la
          cotización hasta la facturación, incluyendo inventario, finanzas y
          control de acceso.
        </p>
      </header>

      {/* Flujo principal */}
      <div className="card p-6 sm:p-8 mb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-rapid-text-muted mb-6">
          Flujo de trabajo (paso a paso)
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

      {/* Compartir documentos */}
      <div className="card p-5 mb-8 flex gap-4 items-start">
        <MessageCircle className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-rapid-text">
            Enviar documentos al cliente
          </p>
          <p className="text-sm text-rapid-text-muted mt-1 leading-relaxed">
            Desde el detalle de cualquier orden, cotización o factura puedes
            enviarla por <strong>WhatsApp</strong> o <strong>correo
            electrónico</strong> directamente al cliente con un enlace para que
            la vea e imprima.
          </p>
        </div>
      </div>

      {/* Módulos adicionales */}
      <h2 className="font-bold text-lg mb-4">Módulos adicionales</h2>
      <div className="grid gap-4 sm:grid-cols-2 mb-8">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.href}
              className="rounded-xl border border-rapid-border bg-white px-5 py-4 flex gap-4 items-start"
            >
              <Icon className="h-5 w-5 shrink-0 text-rapid-text-muted mt-0.5" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-rapid-text">
                  {mod.title}
                </p>
                <p className="text-sm text-rapid-text-muted mt-0.5 leading-relaxed">
                  {mod.description}
                </p>
                <Link
                  href={mod.href}
                  className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-rapid-text hover:text-rapid-green-dark transition"
                >
                  {mod.linkLabel}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="card p-5 mb-8 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-rapid-text-muted">
          Tips importantes
        </p>
        <ul className="space-y-2 text-sm text-rapid-text-muted">
          <li className="flex gap-2">
            <span className="text-rapid-green font-bold">1.</span>
            <span>
              <strong>Configura tu taller primero:</strong> ve a Configuración para
              poner el nombre, RNC, logo y datos que aparecen en las impresiones.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-rapid-green font-bold">2.</span>
            <span>
              <strong>Registra tu inventario:</strong> los materiales y pinturas
              deben estar en el sistema antes de hacer requisiciones.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-rapid-green font-bold">3.</span>
            <span>
              <strong>Registra empleados:</strong> necesitas tener empleados dados
              de alta para asignarles trabajo y calcular sus pagos por pieza.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-rapid-green font-bold">4.</span>
            <span>
              <strong>El Dashboard te resume todo:</strong> ingresos, costos, gastos,
              utilidad neta, vehículos en taller y órdenes recientes.
            </span>
          </li>
        </ul>
      </div>

      {/* Quick actions */}
      <div className="flex flex-col sm:flex-row gap-3">
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
