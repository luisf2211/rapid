import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, MessageCircle, Phone } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { autoRepairSchema, breadcrumbSchema } from "@/lib/seo/jsonld";
import {
  getWorkshopProfile,
  resolveCityWithDensity,
  listDirectoryWorkshops,
} from "@/services/workshops-directory.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const w = await getWorkshopProfile(slug).catch(() => null);

  if (!w || !w.isApproved) {
    // ¿Es una ciudad con densidad suficiente?
    const city = await resolveCityWithDensity(slug).catch(() => null);
    if (city) {
      return buildMetadata({
        title: `Talleres de pintura automotriz en ${city.city}`,
        description: `Encuentra talleres de pintura, desabolladura, bumper, rayones y detailing en ${city.city}. Cotiza tu vehículo en línea con Rapid.`,
        path: `/talleres/${slug}`,
        keywords: [
          `talleres de pintura ${city.city}`,
          `pintura automotriz ${city.city}`,
          `taller de pintura en ${city.city}`,
        ],
      });
    }
    return buildMetadata({
      title: "Taller no disponible",
      description: "Este perfil no está disponible.",
      path: `/talleres/${slug}`,
      noindex: true,
    });
  }

  const cityPart = w.city ? ` en ${w.city}` : "";
  return buildMetadata({
    title: `${w.name} — Taller de pintura automotriz${cityPart}`,
    description:
      w.description?.slice(0, 160) ||
      `${w.name}: pintura automotriz, desabolladura, bumper, rayones y detailing${cityPart}. Cotiza en línea con Rapid.`,
    path: `/talleres/${w.slug}`,
    keywords: [
      w.name,
      "taller de pintura",
      w.city ? `taller de pintura ${w.city}` : "pintura automotriz",
      ...w.services,
    ],
  });
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default async function WorkshopProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const w = await getWorkshopProfile(slug).catch(() => null);

  // Si no es un taller aprobado, puede ser una página de ciudad con densidad.
  if (!w || !w.isApproved) {
    const city = await resolveCityWithDensity(slug).catch(() => null);
    if (city) {
      const workshops = await listDirectoryWorkshops({ citySlug: slug }).catch(
        () => [],
      );
      return <CityListing citySlug={slug} cityName={city.city} workshops={workshops} />;
    }
    // Perfiles/ciudades sin contenido: 404 (no indexar vacíos).
    notFound();
  }

  const waHref = w.whatsapp
    ? `https://wa.me/${w.whatsapp.replace(/[^0-9]/g, "")}`
    : null;
  const telHref = w.phone ? `tel:${w.phone.replace(/[^0-9+]/g, "")}` : null;

  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={[
          autoRepairSchema({
            slug: w.slug,
            name: w.name,
            description: w.description,
            logoUrl: w.logoUrl,
            phone: w.phone,
            address: w.address,
            city: w.city,
            latitude: w.latitude,
            longitude: w.longitude,
            services: w.services,
          }),
          breadcrumbSchema([
            { name: "Inicio", path: "/" },
            { name: "Talleres", path: "/talleres" },
            { name: w.name, path: `/talleres/${w.slug}` },
          ]),
        ]}
      />
      <PublicHeader />

      <main className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/talleres"
          className="text-sm text-rapid-text-muted transition-colors hover:text-rapid-text"
        >
          ← Todos los talleres
        </Link>

        {/* Cabecera del perfil */}
        <div className="mt-6 flex flex-col gap-5 border-b border-rapid-border pb-8 sm:flex-row sm:items-center">
          {w.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={w.logoUrl}
              alt={w.name}
              className="h-20 w-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rapid-black text-xl font-bold text-rapid-green">
              {initialsOf(w.name)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-semibold tracking-tight text-rapid-text">
              {w.name}
            </h1>
            {w.tagline && (
              <p className="mt-1 text-rapid-text-muted">{w.tagline}</p>
            )}
            {w.city && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-rapid-text-muted-soft">
                <MapPin className="h-4 w-4" />
                {w.address ? `${w.address}, ${w.city}` : w.city}
              </p>
            )}
          </div>
          <Link
            href={`/cotizar/${w.slug}`}
            className="btn-primary gap-2 sm:self-start"
          >
            Cotizar aquí
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Descripción */}
        {w.description && (
          <section className="border-b border-rapid-border py-8">
            <h2 className="text-lg font-semibold text-rapid-text">
              Sobre el taller
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-rapid-text-body">
              {w.description}
            </p>
          </section>
        )}

        {/* Servicios */}
        {w.services.length > 0 && (
          <section className="border-b border-rapid-border py-8">
            <h2 className="text-lg font-semibold text-rapid-text">Servicios</h2>
            <ul className="mt-4 flex flex-wrap gap-2.5">
              {w.services.map((s) => (
                <li
                  key={s}
                  className="rounded-full border border-rapid-border px-4 py-2 text-[15px] text-rapid-text-body"
                >
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Contacto */}
        <section className="py-8">
          <h2 className="text-lg font-semibold text-rapid-text">Contacto</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={`/cotizar/${w.slug}`} className="btn-primary gap-2">
              Solicitar cotización
              <ArrowRight className="h-4 w-4" />
            </Link>
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            )}
            {telHref && (
              <a href={telHref} className="btn-secondary gap-2">
                <Phone className="h-4 w-4" />
                Llamar
              </a>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function CityAvatar({ name, logoUrl }: { name: string; logoUrl: string | null }) {
  if (logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={logoUrl} alt={name} className="h-14 w-14 rounded-xl object-cover" />;
  }
  return (
    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-rapid-black text-base font-bold text-rapid-green">
      {initialsOf(name)}
    </div>
  );
}

/** Listado de talleres de una ciudad con densidad suficiente. */
function CityListing({
  citySlug,
  cityName,
  workshops,
}: {
  citySlug: string;
  cityName: string;
  workshops: {
    slug: string;
    name: string;
    logoUrl: string | null;
    city: string | null;
    services: string[];
  }[];
}) {
  return (
    <div className="min-h-screen bg-white">
      <JsonLd
        data={breadcrumbSchema([
          { name: "Inicio", path: "/" },
          { name: "Talleres", path: "/talleres" },
          { name: cityName, path: `/talleres/${citySlug}` },
        ])}
      />
      <PublicHeader />

      <section className="border-b border-rapid-border pt-16">
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
          <nav className="text-sm text-rapid-text-muted-soft">
            <Link href="/talleres" className="hover:text-rapid-text">
              Talleres
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-rapid-text-muted">{cityName}</span>
          </nav>
          <h1 className="mt-4 text-[2.3rem] font-semibold leading-[1.08] tracking-[-0.025em] text-rapid-text sm:text-5xl">
            Talleres de pintura automotriz en {cityName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-rapid-text-muted">
            {workshops.length} talleres activos en {cityName}. Compara y cotiza
            el trabajo de tu vehículo en línea.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="grid gap-4 sm:grid-cols-2">
            {workshops.map((w) => (
              <Link
                key={w.slug}
                href={`/talleres/${w.slug}`}
                className="group flex items-start gap-4 rounded-2xl border border-rapid-border bg-white p-5 transition-colors hover:border-rapid-text/25"
              >
                <CityAvatar name={w.name} logoUrl={w.logoUrl} />
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
                </div>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-rapid-text-muted-soft transition-transform group-hover:translate-x-0.5 group-hover:text-rapid-green" />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
