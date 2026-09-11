import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Car, Mail, Phone, User } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import {
  getRequestById,
  markRequestViewed,
} from "@/services/quote-requests.service";
import { RequestActions } from "./RequestActions";

export const dynamic = "force-dynamic";

function DataRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof User;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <Icon className="h-4 w-4 shrink-0 text-rapid-text-muted-soft" />
      <span className="w-24 shrink-0 text-sm text-rapid-text-muted">{label}</span>
      <span className="text-sm font-medium text-rapid-text">{value}</span>
    </div>
  );
}

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const request = await getRequestById(id);
  if (!request) notFound();

  // Si ya fue procesada (aceptada/rechazada), redirige el foco a cotizaciones.
  const isProcessed = request.status !== "REQUESTED";

  // Marca como vista al abrir (solo si sigue en bandeja).
  if (!isProcessed) {
    await markRequestViewed(id);
  }

  const vehicle = [request.brand, request.model, request.vehicleYear?.toString()]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="max-w-3xl pb-8">
      <Link
        href="/solicitudes"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-rapid-text-muted hover:text-rapid-text"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a solicitudes
      </Link>

      <PageHeader
        title="Solicitud de cotización"
        subtitle={`Enviada desde el portal · ${request.customerName}`}
      />

      {isProcessed && (
        <div className="card mb-4 border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Esta solicitud ya fue procesada (estado actual: {request.status}).
          {request.quotationNumber > 0 && (
            <>
              {" "}
              <Link
                href={`/quotations/${request.id}`}
                className="font-semibold underline"
              >
                Ver la cotización #{request.quotationNumber}
              </Link>
              .
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Cliente */}
        <div className="card p-6">
          <p className="section-label mb-2">Cliente</p>
          <DataRow icon={User} label="Nombre" value={request.customerName} />
          {request.phone && (
            <DataRow icon={Phone} label="Teléfono" value={request.phone} />
          )}
          {request.email && (
            <DataRow icon={Mail} label="Correo" value={request.email} />
          )}
        </div>

        {/* Vehículo */}
        <div className="card p-6">
          <p className="section-label mb-2">Vehículo</p>
          {vehicle ? (
            <DataRow icon={Car} label="Vehículo" value={vehicle} />
          ) : (
            <p className="py-2.5 text-sm text-rapid-text-muted-soft">
              Sin datos de vehículo
            </p>
          )}
          {request.color && (
            <DataRow icon={Car} label="Color" value={request.color} />
          )}
          {request.plate && (
            <DataRow icon={Car} label="Placa" value={request.plate} />
          )}
        </div>
      </div>

      {/* Mensaje del cliente */}
      {request.customerMessage && (
        <div className="card mt-4 p-6">
          <p className="section-label mb-2">Qué necesita</p>
          <p className="whitespace-pre-line text-rapid-text-body">
            {request.customerMessage}
          </p>
        </div>
      )}

      {/* Fotos */}
      {request.photos.length > 0 && (
        <div className="card mt-4 p-6">
          <p className="section-label mb-3">
            Fotos ({request.photos.length})
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {request.photos.map((p) => (
              <a
                key={p.id}
                href={p.photoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block aspect-square overflow-hidden rounded-lg border border-rapid-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.photoUrl}
                  alt="Foto del cliente"
                  className="h-full w-full object-cover transition-transform hover:scale-105"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Acciones */}
      {!isProcessed && <RequestActions id={request.id} phone={request.phone} />}
    </div>
  );
}
