import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbSchema } from "@/lib/seo/jsonld";
import {
  listDirectoryWorkshops,
  listWorkshopCities,
} from "@/services/workshops-directory.service";

export const metadata: Metadata = buildMetadata({
  title: "Talleres de pintura automotriz y detailing",
  description:
    "Encuentra talleres de pintura automotriz, desabolladura, reparación de bumper y detailing. Compara y cotiza tu vehículo en línea con Rapid.",
  path: "/talleres",
  keywords: [
    "talleres de pintura automotriz",
    "taller de pintura cerca de mí",
    "talleres de detailing",
    "directorio de talleres",
  ],
});

export const dynamic = "force-dynamic";

function Avatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={name} className="h-14 w-14 rounded-xl object-cover" />;
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rapid-black text-base font-bold text-rapid-green">
      {initials}
    </div>
  );
}

export default async function TalleresPage() {
  let workshops: Awaited<ReturnType<typeof listDirectoryWorkshops>> = [];
  let cities: Awaited<ReturnType<typeof listWorkshopCities>> = [];
  try {
    [workshops, cities] = await Promise.all([
      listDirectoryWorkshops(),
      listWorkshopCities(),
    ]);
  } catch {
    /* sin BD: página vacía manejada abajo */
  }

  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Talleres", path: "/talleres" },
        ])}
      />
      <PublicHeader />

      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
            Directorio
          </p>
          <h1 className="mt-4 text-[2.3rem] font-semibold leading-[1.08] tracking-[-0.025em] text-rapid-text sm:text-5xl">
            Talleres de pintura automotriz y detailing
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-rapid-text-muted">
            Descubre talleres activos en Rapid y cotiza el trabajo de tu
            vehículo en línea, con fotos y respuesta directa del taller.
          </p>

          {cities.length > 1 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {cities.map((c) => (
                <span
                  key={c.citySlug}
                  className="rounded-full border border-rapid-border px-3 py-1.5 text-sm text-rapid-text-muted"
                >
                  {c.city} ({c.count})
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
          {workshops.length === 0 ? (
            <p className="text-rapid-text-body">
              Aún no hay talleres publicados. Vuelve pronto.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {workshops.map((w) => (
                <Link
                  key={w.slug}
                  href={`/talleres/${w.slug}`}
                  className="group flex items-start gap-4 rounded-2xl border border-rapid-border bg-white p-5 transition-colors hover:border-rapid-text/25"
                >
                  <Avatar name={w.name} logoUrl={w.logoUrl} />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-semibold text-rapid-text">
                      {w.name}
                    </h2>
                    {w.city && (
                      <p className="mt-0.5 flex items-center gap-1 text-sm text-rapid-text-muted-soft">
                        <MapPin className="h-3.5 w-3.5" />
                        {w.city}
                      </p>
                    )}
                    {w.services.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-sm text-rapid-text-muted">
                        {w.services.slice(0, 3).join(" · ")}
                      </p>
                    )}
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-rapid-text-muted-soft transition-transform group-hover:translate-x-0.5 group-hover:text-rapid-green" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
