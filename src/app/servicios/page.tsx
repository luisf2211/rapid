import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import { SERVICES } from "@/lib/content/services";

export const metadata: Metadata = buildMetadata({
  title: "Servicios de pintura y reparación automotriz",
  description:
    "Pintura de vehículos, pintura de bumper, desabolladura, reparación de rayones y detailing. Conoce cada servicio y cotiza tu vehículo en línea.",
  path: "/servicios",
  keywords: [
    "servicios de pintura automotriz",
    "reparación de vehículos",
    "pintura de bumper",
    "desabolladura y pintura",
    "detailing",
  ],
});

export default function ServiciosPage() {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Servicios", path: "/servicios" },
        ])}
      />
      <PublicHeader />

      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
            Servicios
          </p>
          <h1 className="mt-4 text-[2.3rem] font-semibold leading-[1.08] tracking-[-0.025em] text-rapid-text sm:text-5xl">
            Servicios de pintura y reparación automotriz
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-rapid-text-muted">
            Conoce cada servicio, entiende qué incluye y cotiza el trabajo de tu
            vehículo en línea con fotos.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {SERVICES.map((s) => (
              <Link
                key={s.slug}
                href={`/servicios/${s.slug}`}
                className="group rounded-2xl border border-rapid-border bg-white p-6 transition-colors hover:border-rapid-text/25"
              >
                <h2 className="text-lg font-semibold text-rapid-text">
                  {s.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-rapid-text-muted">
                  {s.intro}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-rapid-text">
                  Ver servicio
                  <ArrowRight className="h-4 w-4 text-rapid-text-muted transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
