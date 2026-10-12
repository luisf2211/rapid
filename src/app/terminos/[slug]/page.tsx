import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublicHeader } from "@/components/public/PublicHeader";
import { buildMetadata } from "@/lib/seo/metadata";
import { getPublicTerms } from "@/services/workshops-directory.service";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const terms = await getPublicTerms(slug).catch(() => null);
  return buildMetadata({
    title: terms
      ? `Condiciones de recepción — ${terms.workshopName}`
      : "Condiciones",
    description:
      "Condiciones de recepción, custodia, reparación y garantía del taller.",
    path: `/terminos/${slug}`,
    noindex: !terms,
  });
}

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(d);
}

export default async function TerminosPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const terms = await getPublicTerms(slug).catch(() => null);
  if (!terms) notFound();

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto max-w-2xl px-5 py-12 sm:px-8 sm:py-16">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-rapid-text-muted">
          {terms.workshopName}
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-rapid-text">
          Condiciones de recepción y garantía
        </h1>
        <p className="mt-2 text-sm text-rapid-text-muted-soft">
          Versión {terms.version}
          {terms.updatedAt ? ` · Actualizado el ${formatDate(terms.updatedAt)}` : ""}
        </p>

        <ol className="mt-8 space-y-4 text-[15px] leading-relaxed text-rapid-text-body">
          {terms.paragraphs.map((p, i) => (
            <li key={i} className="flex gap-3">
              <span className="shrink-0 font-semibold text-rapid-text-muted-soft tabular-nums">
                {i + 1}.
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        <p className="mt-10 border-t border-rapid-border pt-6 text-sm text-rapid-text-muted">
          Al firmar la orden de recepción, el cliente declara haber revisado y
          aceptado estas condiciones.
        </p>
      </main>
    </div>
  );
}
