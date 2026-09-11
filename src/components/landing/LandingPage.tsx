import Link from "next/link";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock,
  FileCheck,
  MessageSquare,
  Phone,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { LandingHeader } from "./LandingHeader";
import { Logo } from "@/components/layout/Logo";

const CONTACT_EMAIL = "reyesbaezluisfelipe@gmail.com";
const CONTACT_WHATSAPP = "18295082211";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola, quiero registrar mi taller en Rapid.",
);

// ─── Cliente: cómo funciona ───────────────────────────────────────────────
const customerSteps = [
  {
    icon: Wrench,
    title: "Elige un taller",
    text: "Escoge el taller donde quieres cotizar tu trabajo. Sin registrarte.",
  },
  {
    icon: Camera,
    title: "Describe y sube fotos",
    text: "Cuéntanos qué necesita tu vehículo y adjunta fotos del daño en segundos.",
  },
  {
    icon: FileCheck,
    title: "Recibe tu propuesta",
    text: "El taller revisa y te entrega su propuesta. Sigue el estado con tu enlace.",
  },
];

// ─── Cliente: por qué usarlo ──────────────────────────────────────────────
const customerBenefits = [
  {
    icon: Clock,
    title: "En minutos, no días",
    text: "Envía tu solicitud desde el celular sin ir en persona ni esperar en el teléfono.",
  },
  {
    icon: MessageSquare,
    title: "Sabes que te vieron",
    text: "Un enlace vivo te muestra cuándo el taller vio tu solicitud y cuándo respondió.",
  },
  {
    icon: ShieldCheck,
    title: "Todo por escrito",
    text: "Tu solicitud, fotos y la propuesta del taller quedan claras en un solo lugar.",
  },
  {
    icon: Phone,
    title: "Contacto directo",
    text: "Si el taller necesita detalles, te llama. Y tú también puedes contactarlo.",
  },
];

// ─── Talleres: módulos (condensado) ───────────────────────────────────────
const shopHighlights = [
  "Solicitudes de clientes que llegan listas para cotizar",
  "Recepción de vehículos con checklist, daños y fotos",
  "Cotizaciones a clientes y aseguradoras",
  "Materiales, mano de obra e inventario conectados",
  "Facturación y control financiero por orden",
  "Multi-empresa: cada taller ve solo sus datos",
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-rapid-bg text-rapid-text">
      <LandingHeader />

      {/* ─── Hero (cliente) ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-16">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full border border-rapid-border bg-rapid-surface-soft px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rapid-text-muted">
            <Sparkles className="h-3.5 w-3.5 text-rapid-green" />
            Pintura automotriz · Detailing
          </p>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-rapid-text sm:text-5xl lg:text-6xl">
            Cotiza el trabajo de tu carro,{" "}
            <span className="text-rapid-green">sin complicarte</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-rapid-text-muted">
            Elige un taller, envía fotos de tu vehículo y recibe una propuesta.
            Rápido, sencillo y desde tu celular.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/cotizar" className="btn-primary min-w-[220px] gap-2 text-base">
              Solicitar cotización
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/rastrear" className="btn-secondary min-w-[200px] gap-2 text-base">
              <Search className="h-4 w-4" />
              Seguir mi solicitud
            </Link>
          </div>
          <ul className="mx-auto mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-rapid-text-muted">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-rapid-green" />
              Sin registro
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-rapid-green" />
              Con fotos
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-rapid-green" />
              Seguimiento en vivo
            </li>
          </ul>
        </div>
      </section>

      {/* ─── Taller destacado ───────────────────────────────────────────── */}
      <section className="border-y border-rapid-border bg-rapid-surface">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
          <Link
            href="/cotizar/bear-jack"
            className="card card-interactive group flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rapid-black text-lg font-bold text-rapid-green">
                BJ
              </div>
              <div>
                <p className="section-label flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-rapid-green" />
                  Taller destacado
                </p>
                <h2 className="mt-0.5 text-lg font-bold text-rapid-text">
                  Bear Jack
                </h2>
                <p className="text-sm text-rapid-text-muted">
                  Pintura automotriz y detailing premium
                </p>
              </div>
            </div>
            <span className="btn-primary w-full justify-center sm:w-auto">
              Cotizar con Bear Jack
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </div>
      </section>

      {/* ─── Cómo funciona (cliente) ────────────────────────────────────── */}
      <section id="como-funciona" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Cómo funciona</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-rapid-text sm:text-4xl">
              Tres pasos y listo
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {customerSteps.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rapid-green-soft text-rapid-green-dark">
                  <step.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-rapid-text">
                  <span className="text-rapid-text-muted-soft">{i + 1}. </span>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-rapid-text-muted">
                  {step.text}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/cotizar" className="btn-primary gap-2">
              Empezar ahora
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Beneficios (cliente) ───────────────────────────────────────── */}
      <section className="border-y border-rapid-border bg-rapid-surface py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="section-label">Por qué te conviene</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-rapid-text sm:text-4xl">
              Pensado para hacerte la vida fácil
            </h2>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {customerBenefits.map((b) => (
              <div
                key={b.title}
                className="card flex items-start gap-4 p-6"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rapid-green-soft text-rapid-green-dark">
                  <b.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-rapid-text">{b.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-rapid-text-muted">
                    {b.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Portal para talleres (dueños) ──────────────────────────────── */}
      <section id="talleres" className="scroll-mt-20 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="surface-dark overflow-hidden p-8 sm:p-12 lg:p-14">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-rapid-green/30 bg-rapid-green/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rapid-green">
                  <Wrench className="h-3.5 w-3.5" />
                  ¿Tienes un taller?
                </p>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Recibe solicitudes y opera tu taller con Rapid
                </h2>
                <p className="mt-4 text-lg on-dark-muted">
                  Rapid es el sistema operativo para talleres de pintura y
                  detailing: recibe las solicitudes de clientes, cotiza, controla
                  materiales y mano de obra, y factura — todo en un flujo.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <a href="#registro" className="btn-primary gap-2">
                    Registrar mi taller
                    <ArrowRight className="h-4 w-4" />
                  </a>
                  <Link
                    href="/login"
                    className="btn-secondary border-white/20 bg-white/5 text-white hover:bg-white/10"
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>

              <ul className="grid gap-3">
                {shopHighlights.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-sm"
                  >
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-rapid-green" />
                    <span className="text-white/90">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Registro de taller ─────────────────────────────────────────── */}
      <section
        id="registro"
        className="scroll-mt-20 border-t border-rapid-border bg-rapid-surface py-20 sm:py-24"
      >
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="text-3xl font-bold tracking-tight text-rapid-text sm:text-4xl">
            Monta tu taller en Rapid
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-rapid-text-muted">
            Solicita el alta de tu empresa y te activamos con acceso completo,
            datos aislados y tu perfil público para recibir cotizaciones de
            clientes.
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
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-rapid-border bg-rapid-black py-12 text-slate-400">
        <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <Logo variant="dark" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed">
              Cotiza el trabajo de tu vehículo con talleres de pintura y
              detailing. Y si tienes un taller, opéralo completo con Rapid.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-sm font-semibold text-white">Para clientes</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/cotizar" className="hover:text-white">
                    Solicitar cotización
                  </Link>
                </li>
                <li>
                  <Link href="/rastrear" className="hover:text-white">
                    Seguir mi solicitud
                  </Link>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-white">
                    Cómo funciona
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Para talleres</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href="#talleres" className="hover:text-white">
                    El portal de talleres
                  </a>
                </li>
                <li>
                  <a href="#registro" className="hover:text-white">
                    Registrar taller
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-sm font-semibold text-white">Contacto</p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
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
        <div className="mx-auto mt-10 max-w-5xl border-t border-white/10 px-4 pt-6 text-center text-xs sm:px-6">
          © {new Date().getFullYear()} Rapid. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
}
