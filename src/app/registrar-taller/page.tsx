import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  FileText,
  Globe,
  Inbox,
  Package,
  Users,
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { BRAND } from "@/lib/seo/config";

export const metadata: Metadata = buildMetadata({
  title: "Software para talleres: administra tu operación y recibe clientes",
  description:
    "Rapid es el software para talleres de pintura automotriz y detailing: cotizaciones, clientes, órdenes, inventario y un perfil público para recibir solicitudes de nuevos clientes.",
  path: "/registrar-taller",
  keywords: [
    "software para talleres",
    "software para taller de pintura",
    "sistema para talleres automotrices",
    "programa para taller",
    "gestión de talleres",
    "software taller automotriz",
    "sistema de cotizaciones para talleres",
  ],
});

const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hola, quiero registrar mi taller en Rapid.",
);

const benefits = [
  {
    icon: FileText,
    title: "Cotizaciones",
    text: "Crea presupuestos para clientes y aseguradoras con mano de obra, materiales y repuestos.",
  },
  {
    icon: Inbox,
    title: "Solicitudes de clientes",
    text: "Recibe pedidos de cotización que llegan desde Rapid, listos para revisar y responder.",
  },
  {
    icon: ClipboardList,
    title: "Órdenes y seguimiento",
    text: "Recepción del vehículo con checklist, daños, fotos y avance del trabajo.",
  },
  {
    icon: Package,
    title: "Inventario y materiales",
    text: "Control de stock, requisiciones por orden y alertas cuando algo baja del mínimo.",
  },
  {
    icon: Users,
    title: "Clientes y equipo",
    text: "Historial de clientes y gestión de empleados y pagos por trabajo.",
  },
  {
    icon: Globe,
    title: "Perfil público",
    text: "Tu taller aparece en Rapid con su perfil, para que nuevos clientes te encuentren y coticen.",
  },
];

const steps = [
  "Nos escribes y validamos los datos de tu taller.",
  "Activamos tu cuenta con acceso completo y datos aislados.",
  "Configuras tu perfil público y empiezas a recibir solicitudes.",
];

export default function RegistrarTallerPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Registrar taller", path: "/registrar-taller" },
        ])}
      />
      <PublicHeader />

      {/* Hero B2B */}
      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center sm:px-8 sm:pb-16 sm:pt-24">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
            Software para talleres
          </p>
          <h1 className="mx-auto mt-6 text-[2.3rem] font-semibold leading-[1.07] tracking-[-0.025em] text-rapid-text sm:text-[3.25rem]">
            Administra tu taller y recibe nuevas oportunidades de trabajo
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-rapid-text-body">
            Rapid organiza tu operación —cotizaciones, clientes, órdenes e
            inventario— y te da un perfil público para recibir solicitudes de
            nuevos clientes.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <Link href="/registrar-taller/crear" className="btn-primary gap-2 px-6 text-base">
              Registrar mi taller
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="text-[15px] font-medium text-rapid-text underline decoration-rapid-border decoration-2 underline-offset-4 transition-colors hover:decoration-rapid-green"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            Todo lo que tu taller necesita
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-rapid-text-muted">
            No es un ERP genérico. Rapid habla el idioma de un taller de pintura
            automotriz y detailing.
          </p>
          <div className="mt-10 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="border-t border-rapid-text pt-4">
                <h3 className="flex items-center gap-2 font-semibold text-rapid-text">
                  <b.icon className="h-4 w-4 text-rapid-green" />
                  {b.title}
                </h3>
                <p className="mt-2 leading-relaxed text-rapid-text-muted">
                  {b.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Cómo empiezas */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            Cómo empiezas
          </h2>
          <ol className="mt-8 divide-y divide-rapid-border">
            {steps.map((s, i) => (
              <li key={s} className="flex items-start gap-4 py-5">
                <span className="text-sm font-medium tabular-nums text-rapid-text-muted-soft">
                  0{i + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-rapid-text-body">
                  {s}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-8">
            <Link href="/registrar-taller/crear" className="btn-primary gap-2 px-6">
              Registrar mi taller
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-sm text-rapid-text-muted">
              ¿Prefieres ayuda? Escríbenos por{" "}
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=${WHATSAPP_MESSAGE}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-rapid-text underline decoration-rapid-border decoration-2 underline-offset-4 hover:decoration-rapid-green"
              >
                WhatsApp
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
