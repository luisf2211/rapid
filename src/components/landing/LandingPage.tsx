import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Car,
  CheckCircle2,
  ClipboardList,
  FileText,
  Layers,
  Package,
  Receipt,
  Shield,
  Sparkles,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";
import { LandingHeader } from "./LandingHeader";
import { Logo } from "@/components/layout/Logo";

const CONTACT_EMAIL = "reyesbaezluisfelipe@gmail.com";
const CONTACT_WHATSAPP = "18295082211";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola, quiero registrar mi taller en Rapid.",
);

const modules = [
  {
    icon: BarChart3,
    title: "Panel operativo",
    description:
      "Visión general del taller: órdenes activas, alertas de stock y estado del pipeline en un solo lugar.",
  },
  {
    icon: FileText,
    title: "Cotizaciones",
    description:
      "Presupuestos para clientes particulares y aseguradoras, con líneas de mano de obra, materiales y repuestos.",
  },
  {
    icon: ClipboardList,
    title: "Órdenes de recepción",
    description:
      "Recepción del vehículo con checklist, daños en carrocería, fotos y datos del cliente.",
  },
  {
    icon: Boxes,
    title: "Requisición de materiales",
    description:
      "Control de consumo por orden, aprobación de materiales y trazabilidad hacia inventario.",
  },
  {
    icon: Wrench,
    title: "Mano de obra",
    description:
      "Desglose por pieza: desabolladura, desarme, preparación, pintura y pulido con costos por área.",
  },
  {
    icon: Receipt,
    title: "Facturación",
    description:
      "Facturas desde la orden o cotización, estados de pago e impresión lista para entregar al cliente.",
  },
  {
    icon: Users,
    title: "Empleados y pagos",
    description:
      "Plantilla del taller, pagos por trabajo, adelantos y liquidaciones de nómina por período.",
  },
  {
    icon: Package,
    title: "Inventario",
    description:
      "Stock de materiales y pintura, movimientos, reservas y alertas cuando el mínimo baja.",
  },
];

const benefits = [
  {
    icon: Zap,
    title: "Menos papeles, más piso de taller",
    text: "Digitaliza recepción, materiales y mano de obra sin perder el flujo que ya conoces.",
  },
  {
    icon: Layers,
    title: "Todo conectado en un solo flujo",
    text: "De la cotización a la factura: cada paso alimenta el resumen financiero de la orden.",
  },
  {
    icon: Shield,
    title: "Multi-empresa desde el diseño",
    text: "Cada taller ve solo sus datos. Ideal para operar varias sucursales o franquicias.",
  },
  {
    icon: Sparkles,
    title: "Hecho para pintura automotriz",
    text: "Checklists, daños en carrocería, requisiciones y mano de obra pensados para tu oficio.",
  },
];

const steps = [
  {
    step: "01",
    title: "Recibe el vehículo",
    text: "Crea la orden con datos del cliente, checklist de recepción, daños y fotografías.",
  },
  {
    step: "02",
    title: "Planifica materiales y trabajo",
    text: "Genera requisiciones e imputa mano de obra por pieza y técnico.",
  },
  {
    step: "03",
    title: "Controla y factura",
    text: "Revisa el resumen financiero, emite la factura y cierra la orden con trazabilidad.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-rapid-bg text-rapid-text">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden bg-rapid-black pt-16 text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(0,200,83,0.25), transparent 45%), radial-gradient(circle at 80% 0%, rgba(0,200,83,0.12), transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-rapid-green/30 bg-rapid-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rapid-green">
              <Car className="h-3.5 w-3.5" />
              SaaS para talleres de pintura
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.25rem]">
              Opera tu taller con{" "}
              <span className="text-rapid-green">claridad</span>, velocidad y
              control total
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Rapid centraliza cotizaciones, recepción de vehículos, materiales,
              mano de obra, inventario y facturación. Menos caos administrativo,
              más autos terminados.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href="#registro" className="btn-primary gap-2">
                Registrar mi taller
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link href="/login" className="btn-secondary border-white/20 bg-white/5 text-white hover:bg-white/10">
                Ya tengo cuenta
              </Link>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-400">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rapid-green" />
                Sin instalación compleja
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rapid-green" />
                Multi-empresa
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-rapid-green" />
                Desde el móvil
              </li>
            </ul>
          </div>

          {/* Dashboard preview mockup */}
          <div className="relative lg:pl-4">
            <div className="absolute -inset-4 rounded-3xl bg-rapid-green/20 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#121816] shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-rapid-green/80" />
                <span className="ml-2 text-xs text-slate-500">rapid.app — panel</span>
              </div>
              <div className="grid gap-3 p-4 sm:grid-cols-2">
                {[
                  { label: "Órdenes activas", value: "24", tone: "text-white" },
                  { label: "En pintura", value: "8", tone: "text-rapid-green" },
                  { label: "Materiales bajo mínimo", value: "3", tone: "text-amber-300" },
                  { label: "Facturado del mes", value: "RD$ 1.2M", tone: "text-white" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] p-4"
                  >
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className={`mt-1 text-2xl font-bold ${stat.tone}`}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-sm font-medium text-white">Pipeline del taller</p>
                  <span className="rounded-full bg-rapid-green/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-rapid-green">
                    En vivo
                  </span>
                </div>
                <div className="space-y-2">
                  {[
                    { plate: "A123456", status: "Recepción", pct: 15 },
                    { plate: "B789012", status: "Materiales", pct: 45 },
                    { plate: "C345678", status: "Pintura", pct: 72 },
                  ].map((row) => (
                    <div key={row.plate} className="flex items-center gap-3">
                      <span className="w-16 text-xs text-slate-400">{row.plate}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-rapid-green"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                      <span className="w-20 text-right text-xs text-slate-400">
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <section className="border-y border-rapid-border bg-rapid-surface">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
          {[
            { value: "8+", label: "Módulos integrados" },
            { value: "1", label: "Flujo de punta a punta" },
            { value: "100%", label: "En la nube" },
            { value: "24/7", label: "Acceso desde cualquier dispositivo" },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-2xl font-bold text-rapid-black sm:text-3xl">
                {item.value}
              </p>
              <p className="mt-1 text-sm text-rapid-text-muted">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="funcionalidades" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-rapid-green">
              Funcionalidades
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-rapid-black sm:text-4xl">
              Todo lo que tu taller necesita, en una sola plataforma
            </h2>
            <p className="mt-4 text-lg text-rapid-text-muted">
              Rapid no es un Excel disfrazado: es un sistema operativo para
              talleres de pintura que quieren crecer con orden.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {modules.map((mod) => (
              <article
                key={mod.title}
                className="group card p-6 transition-shadow hover:shadow-float"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-rapid-black text-rapid-green transition-colors group-hover:bg-rapid-green group-hover:text-rapid-black">
                  <mod.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-rapid-black">
                  {mod.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-rapid-text-muted">
                  {mod.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section
        id="flujo"
        className="scroll-mt-20 border-y border-rapid-border bg-rapid-surface py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-rapid-green">
                Cómo funciona
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-rapid-black sm:text-4xl">
                Del ingreso del auto al cobro, sin perder el hilo
              </h2>
              <p className="mt-4 text-lg text-rapid-text-muted">
                El flujo de Rapid sigue la lógica real del piso de taller:
                recepción, materiales, mano de obra y cierre financiero.
              </p>
            </div>
            <div className="space-y-4">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-rapid-border bg-rapid-bg p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rapid-black text-sm font-bold text-rapid-green">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-semibold text-rapid-black">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-rapid-text-muted">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="beneficios" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="surface-dark overflow-hidden p-8 sm:p-12 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-rapid-green">
                  Por qué Rapid
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Diseñado para talleres que no pueden permitirse el desorden
                </h2>
                <p className="mt-4 text-lg on-dark-muted">
                  Cada minuto en papeles es un minuto menos en el cabina. Rapid
                  te devuelve tiempo operativo y visibilidad sobre tu negocio.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-white/10 bg-white/[0.04] p-5"
                  >
                    <item.icon className="h-5 w-5 text-rapid-green" />
                    <h3 className="mt-3 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm on-dark-muted">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA / Registration */}
      <section id="registro" className="scroll-mt-20 border-t border-rapid-border bg-rapid-surface py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-rapid-green text-rapid-black shadow-[0_8px_30px_rgba(0,200,83,0.35)]">
            <Wallet className="h-7 w-7" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-rapid-black sm:text-4xl">
            Únete a los talleres que ya operan con Rapid
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-rapid-text-muted">
            Solicita el alta de tu empresa y te activamos con usuarios, datos
            aislados y acceso completo a todos los módulos. Empieza a digitalizar
            tu taller hoy.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Registro de taller Rapid")}`}
              className="btn-primary min-w-[220px] gap-2"
            >
              Solicitar registro
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP}?text=${WHATSAPP_MESSAGE}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary min-w-[220px]"
            >
              WhatsApp 829-508-2211
            </a>
            <Link href="/login" className="btn-dark min-w-[220px]">
              Acceder a mi cuenta
            </Link>
          </div>
          <p className="mt-6 text-sm text-rapid-text-muted">
            ¿Eres administrador de plataforma?{" "}
            <Link href="/login" className="font-medium text-rapid-green hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-rapid-border bg-rapid-black py-12 text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <div>
            <Logo variant="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Sistema SaaS para talleres de pintura automotriz. Cotizaciones,
              recepción, materiales, mano de obra e inventario en un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-white">Producto</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#funcionalidades" className="hover:text-white">
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a href="#flujo" className="hover:text-white">
                    Cómo funciona
                  </a>
                </li>
                <li>
                  <a href="#beneficios" className="hover:text-white">
                    Beneficios
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Acceso</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/login" className="hover:text-white">
                    Iniciar sesión
                  </Link>
                </li>
                <li>
                  <a href="#registro" className="hover:text-white">
                    Registrar taller
                  </a>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold text-white">Contacto</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a
                    href={`mailto:${CONTACT_EMAIL}`}
                    className="hover:text-white"
                  >
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li>
                  <a
                    href={`https://wa.me/${CONTACT_WHATSAPP}?text=${WHATSAPP_MESSAGE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white"
                  >
                    WhatsApp 829-508-2211
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 px-4 pt-6 text-center text-xs sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Rapid. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
