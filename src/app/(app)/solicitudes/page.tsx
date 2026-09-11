import Link from "next/link";
import { Inbox, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listRequests } from "@/services/quote-requests.service";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} d`;
}

export default async function SolicitudesPage({ searchParams }: PageProps) {
  const { q } = await searchParams;

  let requests: Awaited<ReturnType<typeof listRequests>> = [];
  let error: string | null = null;
  try {
    requests = await listRequests({ search: q });
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  return (
    <>
      <PageHeader
        title="Solicitudes"
        subtitle="Pedidos de cotización que llegan desde el portal de clientes."
      />

      <form
        method="get"
        className="card p-3 mb-4 flex flex-col sm:flex-row gap-2 sm:items-center"
      >
        <div className="relative flex-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rapid-text-muted"
            aria-hidden
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Cliente, teléfono, placa o vehículo..."
            className="form-input w-full pl-9"
          />
        </div>
        <button type="submit" className="btn-dark">
          Buscar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          No se pudo cargar el listado.
        </div>
      )}

      {!error && requests.length === 0 && (
        <div className="card p-12 text-center">
          <Inbox className="w-10 h-10 mx-auto text-rapid-text-muted-soft mb-3" />
          <p className="text-sm font-medium text-rapid-text">
            No hay solicitudes nuevas
          </p>
          <p className="mt-1 text-sm text-rapid-text-muted">
            Cuando un cliente envíe una solicitud desde el portal, aparecerá aquí.
          </p>
        </div>
      )}

      {!error && requests.length > 0 && (
        <div className="space-y-3">
          {requests.map((r) => {
            const vehicle = [r.brand, r.model, r.vehicleYear?.toString()]
              .filter(Boolean)
              .join(" · ");
            const isNew = r.viewedByShopAt == null;
            return (
              <Link
                key={r.id}
                href={`/solicitudes/${r.id}`}
                className="card card-interactive flex items-start gap-4 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rapid-green-soft text-rapid-green-dark">
                  <Inbox className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold text-rapid-text">
                      {r.customerName}
                    </p>
                    {isNew && (
                      <span className="shrink-0 rounded-full bg-rapid-green px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Nueva
                      </span>
                    )}
                  </div>
                  {vehicle && (
                    <p className="truncate text-sm text-rapid-text-muted">
                      {vehicle}
                      {r.plate ? ` · ${r.plate}` : ""}
                    </p>
                  )}
                  {r.customerMessage && (
                    <p className="mt-1 line-clamp-2 text-sm text-rapid-text-body">
                      {r.customerMessage}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  {r.createdAt && (
                    <p className="text-xs text-rapid-text-muted-soft">
                      {timeAgo(r.createdAt)}
                    </p>
                  )}
                  {r.phone && (
                    <p className="mt-1 text-xs font-medium text-rapid-text-muted">
                      {r.phone}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
