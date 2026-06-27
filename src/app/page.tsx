import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LandingPage } from "@/components/landing/LandingPage";
import { getSession } from "@/lib/auth/session";
import { USER_ROLES } from "@/lib/auth/constants";

export const metadata: Metadata = {
  title: "Rapid · Software para talleres de pintura automotriz",
  description:
    "Digitaliza cotizaciones, recepción de vehículos, materiales, mano de obra, inventario y facturación. SaaS multi-empresa para talleres de pintura.",
  openGraph: {
    title: "Rapid · Opera tu taller con claridad",
    description:
      "El sistema operativo para talleres de pintura automotriz. Registra tu taller y empieza hoy.",
  },
};

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    if (session.role === USER_ROLES.PLATFORM_ADMIN) {
      redirect("/admin");
    }
    redirect("/dashboard");
  }

  return <LandingPage />;
}
