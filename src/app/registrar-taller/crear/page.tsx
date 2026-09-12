import type { Metadata } from "next";
import Link from "next/link";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { SERVICES } from "@/lib/content/services";
import { WorkshopSignupForm } from "./WorkshopSignupForm";

export const metadata: Metadata = buildMetadata({
  title: "Crear cuenta de taller",
  description: "Registra tu taller en Rapid en unos minutos.",
  path: "/registrar-taller/crear",
  noindex: true, // formulario: no indexar
});

export default function CrearTallerPage() {
  const serviceOptions = SERVICES.map((s) => s.name);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/registrar-taller"
          className="text-sm text-rapid-text-muted transition-colors hover:text-rapid-text"
        >
          ← Volver
        </Link>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-rapid-text">
          Registra tu taller
        </h1>
        <p className="mt-2 text-rapid-text-muted">
          Crea tu cuenta y empieza a gestionar tu operación. Tu perfil público
          se activa tras una revisión rápida.
        </p>

        <div className="mt-8">
          <WorkshopSignupForm serviceOptions={serviceOptions} />
        </div>
      </main>
    </div>
  );
}
