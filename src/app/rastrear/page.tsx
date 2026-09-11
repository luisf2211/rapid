import type { Metadata } from "next";
import { PublicHeader } from "@/components/public/PublicHeader";
import { TrackLookupForm } from "./TrackLookupForm";

export const metadata: Metadata = {
  title: "Seguir mi solicitud · Rapid",
  description: "Consulta el estado de tu solicitud de cotización.",
};

export default function TrackLookupPage() {
  return (
    <div className="min-h-screen bg-rapid-bg">
      <PublicHeader />

      <main className="mx-auto max-w-lg px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-3xl font-bold tracking-tight text-rapid-text">
          Sigue tu solicitud
        </h1>
        <p className="mt-3 text-rapid-text-muted">
          Pega el enlace de seguimiento que recibiste al enviar tu solicitud, o
          el código que aparece al final del enlace.
        </p>

        <div className="card mt-8 p-6 sm:p-8">
          <TrackLookupForm />
        </div>
      </main>
    </div>
  );
}
