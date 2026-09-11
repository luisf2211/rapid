import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/constants";
import { listPublicWorkshops } from "@/services/public-quotations.service";

const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://rapidcar.app"
).replace(/\/$/, "");

const TITLE = "Rapid · Cotiza el trabajo de tu carro en minutos";
const DESCRIPTION =
  "Pide cotización a talleres de pintura automotriz y detailing sin llamadas. Sube fotos de tu vehículo, recibe una propuesta y sigue el estado en línea. Rápido y desde tu celular.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · Rapid",
  },
  description: DESCRIPTION,
  applicationName: "Rapid",
  keywords: [
    "cotizar pintura de carro",
    "taller de pintura automotriz",
    "car detailing",
    "cotización de reparación de vehículo",
    "latonería y pintura",
    "República Dominicana",
    "Rapid",
  ],
  alternates: { canonical: "/" },
  authors: [{ name: "Rapid" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Rapid",
    title: TITLE,
    description: DESCRIPTION,
    locale: "es_DO",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

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
