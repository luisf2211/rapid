import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, MapPin, Star, Wrench } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { listPublicWorkshops } from "@/services/public-quotations.service";

export const metadata: Metadata = {
  title: "Cotiza tu trabajo · Rapid",
  description:
    "Elige un taller y recibe una propuesta para el trabajo de tu vehículo. Rápido, sencillo y sin llamadas.",
};

export const dynamic = "force-dynamic";

function WorkshopAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={logoUrl}
        alt={name}
        className="h-14 w-14 rounded-2xl object-cover"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rapid-black text-lg font-bold text-rapid-green">
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

  const featured = workshops[0];
  const rest = workshops.slice(1);

  return (
    <div className="min-h-screen bg-rapid-bg">
      <PublicHeader />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-rapid-text sm:text-4xl">
            ¿Qué necesita tu vehículo?
          </h1>
          <p className="mt-3 text-lg text-rapid-text-muted">
            Elige un taller y en un par de minutos envías tu solicitud con
            fotos. El taller revisa y te entrega su propuesta.
          </p>
        </div>

        {loadError ? (
          <div className="mt-10 rounded-2xl border border-rapid-border bg-white p-8 text-center">
            <p className="text-rapid-text-body">
              No pudimos cargar los talleres en este momento. Intenta de nuevo
              en unos minutos.
            </p>
          </div>
        ) : workshops.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-rapid-border bg-white p-8 text-center">
            <p className="text-rapid-text-body">
              Aún no hay talleres disponibles para cotizar en línea.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-8">
            {featured && (
              <section>
                <p className="section-label mb-3 flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-rapid-green" />
                  Taller destacado
                </p>
                <Link
                  href={`/cotizar/${featured.slug}`}
                  className="card card-interactive group flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7"
                >
                  <div className="flex items-center gap-4">
                    <WorkshopAvatar name={featured.name} logoUrl={featured.logoUrl} />
                    <div>
                      <h2 className="text-xl font-bold text-rapid-text">
                        {featured.name}
                      </h2>
                      {featured.tagline && (
                        <p className="mt-0.5 text-sm text-rapid-text-muted">
                          {featured.tagline}
                        </p>
                      )}
                      {featured.city && (
                        <p className="mt-1 flex items-center gap-1 text-sm text-rapid-text-muted-soft">
                          <MapPin className="h-3.5 w-3.5" />
                          {featured.city}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="btn-primary w-full justify-center sm:w-auto">
                    Cotizar aquí
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </section>
            )}

            {rest.length > 0 && (
              <section>
                <p className="section-label mb-3">Otros talleres</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {rest.map((w) => (
                    <Link
                      key={w.slug}
                      href={`/cotizar/${w.slug}`}
                      className="card card-interactive group flex items-center gap-4 p-5"
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
                      <ArrowRight className="h-4 w-4 shrink-0 text-rapid-text-muted-soft transition-transform group-hover:translate-x-0.5 group-hover:text-rapid-green" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        <div className="mt-14 flex items-center gap-3 rounded-2xl border border-rapid-border bg-rapid-surface-soft p-5 text-sm text-rapid-text-muted">
          <Wrench className="h-5 w-5 shrink-0 text-rapid-green" />
          <p>
            ¿Ya enviaste una solicitud?{" "}
            <Link href="/rastrear" className="font-semibold text-rapid-green hover:underline">
              Sigue su estado aquí
            </Link>
            .
          </p>
        </div>
      </main>
    </div>
  );
}
