import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { serviceSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import { getService, allServiceSlugs } from "@/lib/content/services";

export function generateStaticParams() {
  return allServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) {
    return buildMetadata({
      title: "Servicio no encontrado",
      description: "El servicio solicitado no existe.",
      path: `/servicios/${slug}`,
      noindex: true,
    });
  }
  return buildMetadata({
    title: s.title,
    description: s.description,
    path: `/servicios/${s.slug}`,
    keywords: s.keywords,
  });
}

function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export default async function ServicioPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const s = getService(slug);
  if (!s) notFound();

  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={[
          serviceSchema({
            name: s.name,
            description: s.description,
            path: `/servicios/${s.slug}`,
          }),
          faqSchema(s.faqs),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Servicios", path: "/servicios" },
            { name: s.name, path: `/servicios/${s.slug}` },
          ]),
        ]}
      />
      <PublicHeader />

      {/* Hero */}
      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
          <nav className="text-sm text-rapid-text-muted-soft">
            <Link href="/servicios" className="hover:text-rapid-text">
              Servicios
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-rapid-text-muted">{s.name}</span>
          </nav>
          <h1 className="mt-4 text-[2.3rem] font-semibold leading-[1.08] tracking-[-0.025em] text-rapid-text sm:text-5xl">
            {s.h1}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-rapid-text-body">
            {s.intro}
          </p>
          <div className="mt-8">
            <Link href="/cotizar" className="btn-primary gap-2 px-6 text-base">
              Solicitar cotización
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Qué incluye */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto grid max-w-3xl gap-10 px-5 py-14 sm:px-8 sm:py-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-rapid-text">
              Qué incluye normalmente
            </h2>
            <ul className="mt-5 space-y-3">
              {s.includes.map((it) => (
                <li key={it} className="flex items-start gap-3 text-rapid-text-body">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-rapid-green" />
                  {it}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-rapid-text">
              Cuándo lo necesitas
            </h2>
            <ul className="mt-5 space-y-3">
              {s.whenYouNeedIt.map((it) => (
                <li key={it} className="flex items-start gap-3 text-rapid-text-body">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rapid-green" />
                  {it}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-rapid-text">
              Antes de cotizar, ten en cuenta
            </h2>
            <ul className="mt-5 space-y-3">
              {s.tips.map((it) => (
                <li key={it} className="flex items-start gap-3 text-rapid-text-body">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rapid-text-muted-soft" />
                  {it}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-rapid-border">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16">
          <h2 className="text-2xl font-semibold tracking-tight text-rapid-text">
            Preguntas frecuentes
          </h2>
          <dl className="mt-6 divide-y divide-rapid-border">
            {s.faqs.map((f) => (
              <div key={f.q} className="py-5">
                <dt className="font-semibold text-rapid-text">{f.q}</dt>
                <dd className="mt-1.5 leading-relaxed text-rapid-text-muted">
                  {f.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* CTA final */}
      <section>
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8 sm:py-20">
          <h2 className="text-3xl font-semibold tracking-tight text-rapid-text">
            ¿Listo para cotizar?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-rapid-text-muted">
            Manda fotos de tu vehículo y recibe una propuesta del taller. Gratis
            y sin llamadas.
          </p>
          <div className="mt-7">
            <Link href="/cotizar" className="btn-primary gap-2 px-6 text-base">
              Cotizar mi vehículo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
