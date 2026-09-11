import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  Circle,
  Clock,
  Eye,
  FileCheck,
  Phone,
  XCircle,
} from "lucide-react";
import { PublicHeader } from "@/components/public/PublicHeader";
import { getPublicQuoteByToken } from "@/services/public-quotations.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Seguimiento de tu solicitud · Rapid",
};

function formatDate(d: Date | null): string {
  if (!d) return "";
  return new Intl.DateTimeFormat("es-DO", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function formatMoney(n: number): string {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    minimumFractionDigits: 0,
  }).format(n);
}

type StepState = "done" | "current" | "pending";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const quote = await getPublicQuoteByToken(token).catch(() => null);

  if (!quote) {
    notFound();
  }

  const isRejected = quote.status === "REJECTED";
  const hasProposal =
    quote.status === "APPROVED" ||
    quote.status === "CONVERTED" ||
    (quote.grandTotal > 0 && quote.respondedAt != null);
  // "Aceptada / en preparación": el taller aceptó la solicitud y está cotizando.
  const isAccepted =
    !hasProposal &&
    !isRejected &&
    (quote.status === "DRAFT" || quote.status === "PENDING");
  const wasViewed =
    quote.viewedByShopAt != null || hasProposal || isRejected || isAccepted;

  const timeline: {
    key: string;
    label: string;
    detail?: string;
    state: StepState;
    icon: typeof Circle;
  }[] = [
    {
      key: "received",
      label: "Solicitud recibida",
      detail: formatDate(quote.createdAt),
      state: "done",
      icon: CheckCircle2,
    },
    {
      key: "viewed",
      label: isAccepted ? "Aceptada por el taller" : "Vista por el taller",
      detail: wasViewed
        ? formatDate(quote.viewedByShopAt) || "Confirmado"
        : "En espera",
      state: wasViewed ? "done" : "current",
      icon: Eye,
    },
    {
      key: "proposal",
      label: isRejected ? "Solicitud cerrada" : "Propuesta lista",
      detail: hasProposal
        ? formatDate(quote.respondedAt) || "Disponible"
        : isRejected
          ? "Ver detalle"
          : "En preparación",
      state: hasProposal || isRejected ? "done" : wasViewed ? "current" : "pending",
      icon: isRejected ? XCircle : FileCheck,
    },
  ];

  const vehicleParts = [
    quote.vehicle.brand,
    quote.vehicle.model,
    quote.vehicle.vehicleYear?.toString(),
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-rapid-bg">
      <PublicHeader />

      <main className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Encabezado / estado */}
        <div className="card p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-label">
                {quote.quotationNumber
                  ? `Cotización #${quote.quotationNumber}`
                  : "Solicitud de cotización"}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-rapid-text">
                {quote.workshop.name}
              </h1>
              {vehicleParts.length > 0 && (
                <p className="mt-1 text-rapid-text-muted">
                  {vehicleParts.join(" · ")}
                  {quote.vehicle.plate ? ` · ${quote.vehicle.plate}` : ""}
                </p>
              )}
            </div>
            <span
              className={`badge ${
                hasProposal
                  ? "badge-success"
                  : isRejected
                    ? "badge-error"
                    : wasViewed
                      ? "badge-info"
                      : "badge-warning"
              }`}
            >
              {hasProposal
                ? "Propuesta lista"
                : isRejected
                  ? "Cerrada"
                  : isAccepted
                    ? "En preparación"
                    : wasViewed
                      ? "En revisión"
                      : "Recibida"}
            </span>
          </div>

          {/* Timeline */}
          <ol className="mt-8 space-y-0">
            {timeline.map((t, i) => {
              const Icon = t.icon;
              const isLast = i === timeline.length - 1;
              return (
                <li key={t.key} className="relative flex gap-4 pb-8 last:pb-0">
                  {!isLast && (
                    <span
                      className={`absolute left-[15px] top-8 h-full w-0.5 ${
                        t.state === "done" ? "bg-rapid-green" : "bg-rapid-border"
                      }`}
                      aria-hidden
                    />
                  )}
                  <span
                    className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      t.state === "done"
                        ? "bg-rapid-green text-white"
                        : t.state === "current"
                          ? "bg-rapid-black text-white"
                          : "bg-rapid-surface-strong text-rapid-text-muted-soft"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="pt-1">
                    <p
                      className={`font-semibold ${
                        t.state === "pending"
                          ? "text-rapid-text-muted-soft"
                          : "text-rapid-text"
                      }`}
                    >
                      {t.label}
                    </p>
                    {t.detail && (
                      <p className="text-sm text-rapid-text-muted">{t.detail}</p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Propuesta del taller */}
        {hasProposal && quote.grandTotal > 0 && (
          <div className="card mt-6 p-6 sm:p-8">
            <p className="section-label">Propuesta del taller</p>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div>
                <p className="text-3xl font-bold text-rapid-text">
                  {formatMoney(quote.grandTotal)}
                </p>
                {quote.estimatedDays != null && (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-rapid-text-muted">
                    <Clock className="h-4 w-4" />
                    Tiempo estimado: {quote.estimatedDays} días
                  </p>
                )}
              </div>
            </div>
            <p className="mt-4 text-sm text-rapid-text-muted">
              El taller se comunicará contigo para coordinar. Ante cualquier
              duda, contáctalos directamente.
            </p>
          </div>
        )}

        {/* Rechazo / cierre */}
        {isRejected && quote.rejectionReason && (
          <div className="card mt-6 p-6 sm:p-8">
            <p className="section-label">Nota del taller</p>
            <p className="mt-2 text-rapid-text-body">{quote.rejectionReason}</p>
          </div>
        )}

        {/* Tu solicitud */}
        <div className="card mt-6 p-6 sm:p-8">
          <p className="section-label">Tu solicitud</p>
          {quote.customerMessage && (
            <p className="mt-2 text-rapid-text-body">{quote.customerMessage}</p>
          )}
          {quote.photos.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {quote.photos.map((p) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={p.id}
                  src={p.photoUrl}
                  alt="Foto enviada"
                  className="aspect-square w-full rounded-lg border border-rapid-border object-cover"
                />
              ))}
            </div>
          )}
        </div>

        {/* Contacto del taller */}
        {quote.workshop.phone && (
          <a
            href={`tel:${quote.workshop.phone.replace(/[^0-9+]/g, "")}`}
            className="btn-secondary mt-6 w-full"
          >
            <Phone className="h-4 w-4" />
            Llamar a {quote.workshop.name}
          </a>
        )}

        <p className="mt-8 text-center text-sm text-rapid-text-muted">
          Guarda este enlace para volver a ver el estado de tu solicitud.{" "}
          <Link href="/cotizar" className="font-semibold text-rapid-green hover:underline">
            Cotizar otro trabajo
          </Link>
        </p>
      </main>
    </div>
  );
}
