import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { LandingHeader } from "./LandingHeader";
import { Logo } from "@/components/layout/Logo";

const CONTACT_EMAIL = "reyesbaezluisfelipe@gmail.com";
const CONTACT_WHATSAPP = "18295082211";
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola, quiero registrar mi taller en Rapid.",
);

const steps = [
  {
    n: "01",
    title: "Elige tu taller",
    text: "Escoge dónde quieres cotizar. No hace falta crear cuenta ni descargar nada.",
  },
  {
    n: "02",
    title: "Cuenta qué pasó",
    text: "Describe el trabajo y sube fotos del vehículo desde el celular. Toma un minuto.",
  },
  {
    n: "03",
    title: "Recibe tu propuesta",
    text: "El taller la revisa y te responde. Te llega un correo y sigues todo con tu enlace.",
  },
];

const shopPoints = [
  "Las solicitudes de tus clientes llegan ordenadas y con fotos.",
  "Cotizas, recibes el vehículo y facturas en un mismo flujo.",
  "Materiales, mano de obra e inventario conectados por orden.",
];

export type FeaturedWorkshop = {
  slug: string;
  name: string;
  tagline: string | null;
  logoUrl: string | null;
};

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function LandingPage({
  featuredWorkshop,
}: {
  featuredWorkshop?: FeaturedWorkshop | null;
}) {
  return (
    <div className="min-h-screen bg-white text-rapid-text">
      <LandingHeader />

      {/* ─── Hero ────────────────────────────────────────────────────────
          Asimétrico, alineado a la izquierda. Tipografía protagonista.
          El verde solo como acento (subrayado del titular). */}
      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
              Pintura automotriz &amp; detailing
            </p>
            <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.05] tracking-[-0.02em] text-rapid-text sm:text-6xl">
              Arregla tu carro
              <br />
              sin dar tantas
              <br />
              <span className="relative whitespace-nowrap">
                vueltas
                <span className="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-rapid-green" />
              </span>
              .
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-rapid-text-body">
              Pide una cotización, manda fotos del daño y deja que el taller te
              responda. Todo desde el teléfono, sin llamadas ni filas.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/cotizar"
                className="btn-primary gap-2 px-6 text-base"
              >
                Pedir cotización
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/rastrear"
                className="text-[15px] font-medium text-rapid-text underline decoration-rapid-border decoration-2 underline-offset-4 transition-colors hover:decoration-rapid-green"
              >
                Ya envié una, ver estado
              </Link>
            </div>
          </div>

          {/* Zona de imagen — lista para foto real del taller/trabajo */}
          <div className="relative">
            <div className="aspect-[4/5] w-full overflow-hidden rounded-3xl bg-rapid-surface-strong">
              {/* Reemplazar por una foto real: <img src="/hero.jpg" ... /> */}
              {featuredWorkshop?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredWorkshop.logoUrl}
                  alt={featuredWorkshop.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,#e9ecef,transparent_60%),radial-gradient(circle_at_80%_90%,#e3e6ea,transparent_55%)]">
                  <span className="text-sm text-rapid-text-muted-soft">
                    Foto del taller
                  </span>
                </div>
              )}
            </div>
            {featuredWorkshop && (
              <Link
                href={`/cotizar/${featuredWorkshop.slug}`}
                className="absolute -bottom-5 left-5 right-5 flex items-center gap-3 rounded-2xl border border-rapid-border bg-white p-3 shadow-[0_12px_40px_rgba(0,0,0,0.10)] transition-transform hover:-translate-y-0.5 sm:left-8 sm:right-auto sm:pr-6"
              >
                {featuredWorkshop.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={featuredWorkshop.logoUrl}
                    alt={featuredWorkshop.name}
                    className="h-11 w-11 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rapid-black text-sm font-semibold text-white">
                    {initialsOf(featuredWorkshop.name)}
                  </div>
                )}
                <div className="pr-2">
                  <p className="text-[11px] uppercase tracking-wide text-rapid-text-muted-soft">
                    Disponible ahora
                  </p>
                  <p className="text-sm font-semibold text-rapid-text">
                    {featuredWorkshop.name}
                  </p>
                </div>
                <ArrowUpRight className="ml-auto hidden h-4 w-4 text-rapid-text-muted sm:block" />
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ─── Cómo funciona ──────────────────────────────────────────────
          Editorial: números grandes, sin cuadritos de colores. */}
      <section id="como-funciona" className="scroll-mt-24 border-b border-rapid-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
          <div className="max-w-xl">
            <h2 className="text-3xl font-semibold tracking-tight text-rapid-text sm:text-4xl">
              Cómo funciona
            </h2>
            <p className="mt-3 text-lg text-rapid-text-muted">
              De la foto a la propuesta en tres pasos. Sin vueltas.
            </p>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="border-t border-rapid-text pt-5">
                <span className="text-sm font-medium tabular-nums text-rapid-text-muted-soft">
                  {s.n}
                </span>
                <h3 className="mt-4 text-xl font-semibold text-rapid-text">
                  {s.title}
                </h3>
                <p className="mt-2 leading-relaxed text-rapid-text-muted">
                  {s.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Frase / promesa ────────────────────────────────────────────
          Bloque tipográfico grande, mucho aire. */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
          <p className="text-2xl font-medium leading-[1.35] tracking-[-0.01em] text-rapid-text sm:text-[2rem]">
            Nada de esperar en el teléfono ni pasar por el taller para preguntar.
            Mandas tus fotos, el taller responde y{" "}
            <span className="text-rapid-text-muted">
              tú decides con calma, con todo por escrito.
            </span>
          </p>
        </div>
      </section>

      {/* ─── Para talleres ──────────────────────────────────────────────
          Sobria, dos columnas, sin bloque oscuro recargado. */}
      <section id="talleres" className="scroll-mt-24 border-b border-rapid-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
              Para talleres
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-rapid-text sm:text-4xl">
              Todo tu taller, en un solo lugar
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-rapid-text-muted">
              Rapid es el sistema con el que los talleres reciben solicitudes,
              cotizan, controlan materiales y facturan. Sin libretas ni chats
              perdidos.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#registro" className="btn-dark gap-2">
                Registrar mi taller
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link
                href="/login"
                className="text-[15px] font-medium text-rapid-text underline decoration-rapid-border decoration-2 underline-offset-4 transition-colors hover:decoration-rapid-green"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>

          <ul className="flex flex-col justify-center divide-y divide-rapid-border">
            {shopPoints.map((p) => (
              <li
                key={p}
                className="flex items-start gap-4 py-4 text-[15px] leading-relaxed text-rapid-text-body"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rapid-green" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ─── Cierre / registro ──────────────────────────────────────────── */}
      <section id="registro" className="scroll-mt-24 border-b border-rapid-border">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-semibold tracking-tight text-rapid-text sm:text-[2.75rem] sm:leading-[1.1]">
              ¿Tienes un taller? Móntalo en Rapid.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-rapid-text-muted">
              Te damos acceso completo, tus datos aislados y un perfil público
              para recibir cotizaciones. Escríbenos y te activamos.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a
                href={`https://wa.me/${CONTACT_WHATSAPP}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary gap-2 px-6"
              >
                Escríbenos por WhatsApp
                <ArrowUpRight className="h-4 w-4" />
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent("Registro de taller Rapid")}`}
                className="text-[15px] font-medium text-rapid-text underline decoration-rapid-border decoration-2 underline-offset-4 transition-colors hover:decoration-rapid-green"
              >
                O por correo
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-14 sm:px-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xs">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed text-rapid-text-muted">
              Cotiza el trabajo de tu vehículo con talleres de pintura y
              detailing. Y si tienes un taller, opéralo completo con Rapid.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="text-[13px] font-semibold text-rapid-text">Clientes</p>
              <ul className="mt-3 space-y-2.5 text-sm text-rapid-text-muted">
                <li>
                  <Link href="/cotizar" className="hover:text-rapid-text">
                    Pedir cotización
                  </Link>
                </li>
                <li>
                  <Link href="/rastrear" className="hover:text-rapid-text">
                    Seguir mi solicitud
                  </Link>
                </li>
                <li>
                  <a href="#como-funciona" className="hover:text-rapid-text">
                    Cómo funciona
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-[13px] font-semibold text-rapid-text">Talleres</p>
              <ul className="mt-3 space-y-2.5 text-sm text-rapid-text-muted">
                <li>
                  <a href="#talleres" className="hover:text-rapid-text">
                    El portal
                  </a>
                </li>
                <li>
                  <a href="#registro" className="hover:text-rapid-text">
                    Registrar taller
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-rapid-text">
                    Iniciar sesión
                  </Link>
                </li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[13px] font-semibold text-rapid-text">Contacto</p>
              <ul className="mt-3 space-y-2.5 text-sm text-rapid-text-muted">
                <li>
                  <a
                    href={`https://wa.me/${CONTACT_WHATSAPP}?text=${WHATSAPP_MESSAGE}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-rapid-text"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-rapid-text">
                    Correo
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t border-rapid-border">
          <div className="mx-auto max-w-6xl px-5 py-6 text-xs text-rapid-text-muted-soft sm:px-8">
            © {new Date().getFullYear()} Rapid
          </div>
        </div>
      </footer>
    </div>
  );
}
