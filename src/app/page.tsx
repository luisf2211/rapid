import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/constants";
import { listPublicWorkshops } from "@/services/public-quotations.service";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Rapid · Cotiza la reparación de tu vehículo online",
  description:
    "Pide cotización de pintura, desabolladura, bumper, rayones o detailing a talleres cerca de ti. Sube fotos, recibe tu propuesta y sigue el estado en línea. ¿Tienes un taller? Gestiona tu operación con Rapid.",
  path: "/",
  keywords: [
    "cotizar pintura de carro",
    "cotizar reparación de vehículo",
    "pintura automotriz",
    "taller de pintura",
    "reparar bumper",
    "desabolladura y pintura",
    "reparación de rayones",
    "detailing",
    "software para talleres",
    "República Dominicana",
  ],
});

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === USER_ROLES.PLATFORM_ADMIN) {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  // Taller destacado (el primero por publicRank) para la tarjeta del landing.
  let featuredWorkshop = null;
  try {
    const workshops = await listPublicWorkshops();
    if (workshops[0]) {
      featuredWorkshop = {
        slug: workshops[0].slug,
        name: workshops[0].name,
        tagline: workshops[0].tagline,
        logoUrl: workshops[0].logoUrl,
      };
    }
  } catch {
    /* sin BD disponible: el landing se muestra sin taller destacado */
  }

  return <LandingPage featuredWorkshop={featuredWorkshop} />;
}
