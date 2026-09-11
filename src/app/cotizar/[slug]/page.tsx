import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { getPublicWorkshopBySlug } from "@/services/public-quotations.service";
import { QuoteRequestForm } from "./QuoteRequestForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const workshop = await getPublicWorkshopBySlug(slug).catch(() => null);
  return {
    title: workshop ? `Cotizar en ${workshop.name} · Rapid` : "Cotizar · Rapid",
  };
}

export default async function WorkshopQuotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const workshop = await getPublicWorkshopBySlug(slug).catch(() => null);

  if (!workshop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-rapid-bg">
      <PublicHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        <Link
          href="/cotizar"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-rapid-text-muted transition-colors hover:text-rapid-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Cambiar de taller
        </Link>

        <div className="mb-8">
          <p className="section-label">Solicitud de cotización</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-rapid-text">
            {workshop.name}
          </h1>
          {workshop.tagline && (
            <p className="mt-1 text-rapid-text-muted">{workshop.tagline}</p>
          )}
        </div>

        <QuoteRequestForm slug={workshop.slug} workshopName={workshop.name} />
      </main>
    </div>
  );
}
