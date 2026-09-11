import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Car,
  ClipboardList,
  MapPin,
  MessageSquare,
  Send,
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { listPublicWorkshops } from "@/services/public-quotations.service";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";

export const metadata: Metadata = buildMetadata({
  title: "Cotiza la reparación de tu vehículo online",
  description:
    "Cotiza pintura de carro, reparación de bumper, desabolladura, rayones y detailing. Sube fotos, describe el trabajo y recibe una propuesta del taller. Gratis y sin llamadas.",
  path: "/cotizar",
  keywords: [
    "cotizar pintura de carro",
    "cotizar reparación de vehículo",
    "pintura automotriz",
    "reparar bumper",
    "pintar bumper",
    "desabolladura y pintura",
    "reparación de rayones",
    "detailing",
  ],
});

export const dynamic = "force-dynamic";

const steps = [
  {
    icon: ClipboardList,
    title: "Selecciona el trabajo",
    text: "Pintura, bumper, desabolladura, rayones o detailing. Nos dices qué necesitas.",
  },
  {
    icon: Car,
    title: "Indica tu vehículo",
    text: "Marca, modelo y año. Toma unos segundos.",
  },
  {
    icon: Camera,
    title: "Sube fotografías",
    text: "Fotos del daño desde el celular para que el taller cotice con precisión.",
  },
  {
    icon: Send,
    title: "Envía la solicitud",
    text: "El taller la recibe, la revisa y prepara tu propuesta.",
  },
  {
    icon: MessageSquare,
    title: "Recibe tu cotización",
    text: "Te avisamos por correo y sigues el estado con tu enlace de seguimiento.",
  },
];

const services = [
  "Pintura de vehículos",
  "Pintura de bumper",
  "Desabolladura y pintura",
  "Reparación de rayones",
  "Detailing y pulido",
];

const faqs = [
  {
    q: "¿Cuánto cuesta cotizar?",
    a: "Nada. Enviar tu solicitud y recibir la propuesta del taller es gratis. Tú decides si aceptas.",
  },
  {
    q: "¿Necesito crear una cuenta?",
    a: "No. Envías tu solicitud con tu nombre, teléfono y correo, y sigues el estado con el enlace que te damos.",
  },
  {
    q: "¿Qué tan rápido responden?",
    a: "Depende del taller, pero la solicitud le llega al instante y la mayoría responde el mismo día.",
  },
];

function WorkshopAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={name} className="h-12 w-12 rounded-xl object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rapid-black text-sm font-bold text-rapid-green">
      {initials}
    </div>
  );
}

export default async function CotizarPage() {
  let workshops: Awaited<ReturnType<typeof listPublicWorkshops>> = [];
  let loadError = false;
  try {
    workshops = await listPublicWorkshops();
  } catch {
    loadError = true;
  }

  // Con un solo taller, el CTA va directo a su formulario.
  const singleWorkshop = workshops.length === 1 ? workshops[0] : null;
  const primaryCtaHref = singleWorkshop
    ? `/cotizar/${singleWorkshop.slug}`
    : "#talleres";

  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Cotizar", path: "/cotizar" },
        ])}
      />
      <PublicHeader />

      {/* Hero B2C */}
      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto max-w-3xl px-5 pb-14 pt-16 text-center sm:px-8 sm:pb-16 sm:pt-24">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
            Pintura, bumper, rayones &amp; detailing
          </p>
          <h1 className="mx-auto mt-6 text-[2.4rem] font-semibold leading-[1.06] tracking-[-0.025em] text-rapid-text sm:text-[3.5rem]">
            Cotiza la reparación de tu vehículo online
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-rapid-text-body">
            Manda fotos del daño, cuéntanos qué necesitas y recibe una propuesta
            de un taller. Gratis, sin llamadas y desde tu teléfono.
          </p>
          <div className="mt-8">
            <Link href={primaryCtaHref} className="btn-primary gap-2 px-6 text-base">
              Cotizar mi vehículo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            Cómo cotizar tu vehículo
          </h2>
          <ol className="mt-10 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map((s, i) => (
              <li key={s.title} className="border-t border-rapid-text pt-4">
                <span className="text-sm font-medium tabular-nums text-rapid-text-muted-soft">
                  0{i + 1}
                </span>
                <h3 className="mt-3 flex items-center gap-2 font-semibold text-rapid-text">
                  <s.icon className="h-4 w-4 text-rapid-green" />
                  {s.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-rapid-text-muted">
                  {s.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Servicios que puedes cotizar */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            Qué puedes cotizar
          </h2>
          <ul className="mt-8 flex flex-wrap gap-3">
            {services.map((s) => (
              <li
                key={s}
                className="rounded-full border border-rapid-border px-4 py-2 text-[15px] text-rapid-text-body"
              >
                {s}
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-2xl text-rapid-text-muted">
            Desde un rayón en la puerta hasta una pintura completa: describe el
            trabajo, adjunta fotos y deja que el taller te diga cuánto y en
            cuánto tiempo.
          </p>
        </div>
      </section>

      {/* Selector de talleres */}
      <section id="talleres" className="scroll-mt-20 border-b border-rapid-border">
        <div className="mx-auto max-w-5xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            Elige un taller y empieza
          </h2>

          {loadError ? (
            <p className="mt-6 text-rapid-text-body">
              No pudimos cargar los talleres ahora. Intenta de nuevo en unos
              minutos.
            </p>
          ) : workshops.length === 0 ? (
            <p className="mt-6 text-rapid-text-body">
              Aún no hay talleres disponibles para cotizar en línea.
            </p>
          ) : (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {workshops.map((w) => (
                <Link
                  key={w.slug}
                  href={`/cotizar/${w.slug}`}
                  className="group flex items-center gap-4 rounded-2xl border border-rapid-border bg-white p-4 transition-colors hover:border-rapid-text/25"
                >
                  <WorkshopAvatar name={w.name} logoUrl={w.logoUrl} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold text-rapid-text">
                      {w.name}
                    </h3>
                    {w.city && (
                      <p className="flex items-center gap-1 text-sm text-rapid-text-muted-soft">
                        <MapPin className="h-3.5 w-3.5" />
                        {w.city}
                      </p>
                    )}
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rapid-text">
                    Cotizar
                    <ArrowRight className="h-4 w-4 text-rapid-text-muted transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            Preguntas frecuentes
          </h2>
          <dl className="mt-8 divide-y divide-rapid-border">
            {faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-semibold text-rapid-text">{f.q}</dt>
                <dd className="mt-1.5 leading-relaxed text-rapid-text-muted">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-8">
            <Link href={primaryCtaHref} className="btn-primary gap-2 px-6">
              Cotizar mi vehículo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <p className="mt-6 text-sm text-rapid-text-muted">
            ¿Ya enviaste una solicitud?{" "}
            <Link href="/rastrear" className="font-medium text-rapid-text underline decoration-rapid-border decoration-2 underline-offset-4 hover:decoration-rapid-green">
              Sigue su estado aquí
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
