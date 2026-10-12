import type { WorkshopPrintInfo } from "@/lib/workshop/print-info";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";
import { PrintWorkshopReceiverSignature } from "@/components/print/PrintWorkshopReceiverSignature";
import { ReceptionDamageMap } from "@/components/work-order/print/ReceptionDamageMap";
import { resolvePhotoUrl } from "@/lib/photos";

/** Fila compacta label + valor. Oculta si no hay valor. */
function Row({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="rdoc-row">
      <span className="rdoc-row-label">{label}</span>
      <span className="rdoc-row-value">{value}</span>
    </div>
  );
}

export function ReceptionOrderDocument({
  data,
  workshop,
  termsUrl,
  termsQrDataUrl,
}: {
  data: ReceptionPrintData;
  workshop: WorkshopPrintInfo;
  termsUrl: string | null;
  termsQrDataUrl: string | null;
}) {
  const vehicleLine =
    [data.brand, data.model, data.vehicleYear].filter(Boolean).join(" ") || null;

  return (
    <article className="rdoc">
      {/* ─── Header ─────────────────────────────────────────────── */}
      <header className="rdoc-header">
        <div className="rdoc-header-left">
          {workshop.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={workshop.logoUrl} alt="" className="rdoc-logo" />
          ) : (
            <div className="rdoc-logo-mark">R</div>
          )}
          <div className="rdoc-brand">
            <div className="rdoc-brand-name">{workshop.businessName}</div>
            {workshop.tagline && (
              <div className="rdoc-brand-tag">{workshop.tagline}</div>
            )}
            <div className="rdoc-brand-meta">
              {workshop.legalName && <div>{workshop.legalName}</div>}
              {workshop.rnc && <div>RNC: {workshop.rnc}</div>}
              {workshop.address && <div>{workshop.address}</div>}
              <div>{[workshop.phone, workshop.email].filter(Boolean).join(" · ")}</div>
            </div>
          </div>
        </div>
        <div className="rdoc-header-right">
          <div className="rdoc-doc-title">{data.docTitle}</div>
          <div className="rdoc-doc-number">No. {data.docNumber}</div>
          <span className="rdoc-status">{data.statusLabel}</span>
          <div className="rdoc-doc-meta">
            <div>Fecha orden: {data.orderDate}</div>
            {data.quotationRef && <div>Cotización: {data.quotationRef}</div>}
          </div>
        </div>
      </header>

      {/* ─── Cliente + Vehículo ─────────────────────────────────── */}
      <div className="rdoc-grid-2">
        <section className="rdoc-box">
          <h2 className="rdoc-box-title">Datos del cliente</h2>
          <Row label="Nombre" value={data.customerName} />
          <Row label="Teléfono" value={data.phone} />
          <Row label="Email" value={data.email} />
          <Row label="Dirección" value={data.address} />
        </section>
        <section className="rdoc-box">
          <h2 className="rdoc-box-title">Datos del vehículo</h2>
          <Row label="Marca / Modelo" value={vehicleLine} />
          <Row label="Color" value={data.color} />
          <Row label="Placa" value={data.plate} />
          <Row label="VIN" value={data.vin} />
          <Row label="Kilometraje" value={data.mileage} />
        </section>
      </div>

      {/* ─── Recepción ──────────────────────────────────────────── */}
      <section className="rdoc-section">
        <h2 className="rdoc-section-title">Recepción del vehículo</h2>
        <div className="rdoc-reception-grid">
          <div>
            <span className="rdoc-mini-label">Entrada</span>
            <span className="rdoc-mini-value">{data.deliveryDateTime}</span>
          </div>
          <div>
            <span className="rdoc-mini-label">Salida estimada</span>
            <span className="rdoc-mini-value">{data.exitDateTime}</span>
          </div>
          <div>
            <span className="rdoc-mini-label">Combustible</span>
            <span className="rdoc-mini-value">{data.fuelLevel}</span>
          </div>
          <div>
            <span className="rdoc-mini-label">Recibido por</span>
            <span className="rdoc-mini-value">{data.receivedBy ?? "—"}</span>
          </div>
        </div>
      </section>

      {/* ─── Daños / condición exterior ─────────────────────────── */}
      <ReceptionDamageMap data={data} />

      {/* ─── Checklist (matriz compacta) ────────────────────────── */}
      <section className="rdoc-section">
        <h2 className="rdoc-section-title">
          Checklist de recepción
          <span className="rdoc-section-sub">
            ({data.checklistChecked} de {data.checklistTotal} verificados)
          </span>
        </h2>
        <div className="rdoc-checklist">
          {data.checklist.map((item, i) => (
            <div key={i} className="rdoc-check">
              <span className={`rdoc-check-box ${item.checked ? "on" : ""}`}>
                {item.checked ? "✓" : ""}
              </span>
              <span className="rdoc-check-label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Observaciones (condicional) ────────────────────────── */}
      {data.observations && (
        <section className="rdoc-section">
          <h2 className="rdoc-section-title">Observaciones</h2>
          <p className="rdoc-observations">{data.observations}</p>
        </section>
      )}

      {/* ─── Aceptación de condiciones + QR ─────────────────────── */}
      <section className="rdoc-section rdoc-terms">
        <div className="rdoc-terms-text">
          <h2 className="rdoc-section-title">Aceptación de condiciones</h2>
          <p>
            El cliente declara haber revisado y aceptado las condiciones de
            recepción, custodia, reparación y garantía aplicables a esta orden.
          </p>
          <p className="rdoc-terms-note">
            Las condiciones completas están disponibles en nuestro
            establecimiento{termsUrl ? " o escaneando el código QR." : "."}
          </p>
        </div>
        {termsQrDataUrl && (
          <div className="rdoc-terms-qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={termsQrDataUrl} alt="QR condiciones" />
            <span>Condiciones</span>
          </div>
        )}
      </section>

      {/* ─── Firmas ─────────────────────────────────────────────── */}
      <section className="rdoc-signatures">
        <div className="rdoc-sig">
          {data.customerReceivedSignature ? (
            <div className="rdoc-sig-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  resolvePhotoUrl(data.customerReceivedSignature) ??
                  data.customerReceivedSignature
                }
                alt=""
              />
            </div>
          ) : (
            <div className="rdoc-sig-line" />
          )}
          <div className="rdoc-sig-label">Firma cliente — entrega</div>
          <div className="rdoc-sig-name">{data.customerName}</div>
        </div>
        <PrintWorkshopReceiverSignature
          workshop={workshop}
          subtitle={<div className="rdoc-sig-name">{data.receivedBy ?? ""}</div>}
        />
        <div className="rdoc-sig">
          <div className="rdoc-sig-line" />
          <div className="rdoc-sig-label">Firma cliente — retiro</div>
          <div className="rdoc-sig-name">Fecha: ___/___/______</div>
        </div>
      </section>
    </article>
  );
}
