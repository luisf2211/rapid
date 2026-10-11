/**
 * Sección de daños / condición exterior del vehículo para impresión.
 * Usa los MISMOS PNG y las MISMAS coordenadas normalizadas que la app.
 * Marcadores numerados (número + letra), legibles en blanco y negro.
 */

import { DAMAGE_TYPES, type VehicleView } from "@/lib/vehicle-damage/catalog";
import { VEHICLE_IMAGES, VEHICLE_IMAGE_RATIO, toPercent } from "@/lib/vehicle-damage/images";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";

const VIEW_LABELS: Record<VehicleView, string> = {
  left: "Lateral izquierdo",
  right: "Lateral derecho",
  front: "Frontal",
  rear: "Trasera",
  top: "Superior",
};

type PrintDamage = ReceptionPrintData["damages"][number];

interface DamageInspectionPageProps {
  data: ReceptionPrintData;
  orderNumber: string;
  customerName: string;
  plate: string | null;
}

/** Una vista del vehículo (PNG) con sus marcadores numerados. */
function PrintView({
  view,
  damages,
}: {
  view: VehicleView;
  damages: PrintDamage[];
}) {
  const viewDamages = damages.filter((d) => d.view === view);
  return (
    <div className="idoc-insp-view">
      <div className="idoc-insp-label">{VIEW_LABELS[view]}</div>
      <div
        className="idoc-insp-img-wrap"
        style={{ aspectRatio: String(VEHICLE_IMAGE_RATIO[view]) }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VEHICLE_IMAGES[view]} alt={VIEW_LABELS[view]} className="idoc-insp-img" />
        {viewDamages.map((d) => (
          <span
            key={d.number}
            className="idoc-insp-marker"
            style={{ left: toPercent(d.x), top: toPercent(d.y) }}
          >
            {d.number}
          </span>
        ))}
      </div>
    </div>
  );
}

export function DamageInspectionPage({ data }: DamageInspectionPageProps) {
  const damages = data.damages;

  return (
    <div className="idoc-inspection-block">
      <div className="idoc-section-title">Daños / condición exterior del vehículo</div>

      {damages.length === 0 ? (
        <p className="idoc-inspection-empty">
          Sin daños exteriores registrados durante la recepción.
        </p>
      ) : (
        <>
          {/* Laterales grandes (ancho completo) */}
          <PrintView view="left" damages={damages} />
          <PrintView view="right" damages={damages} />

          {/* Frontal, trasera, superior — más pequeños */}
          <div className="idoc-insp-row-3">
            <PrintView view="front" damages={damages} />
            <PrintView view="rear" damages={damages} />
            <PrintView view="top" damages={damages} />
          </div>

          {/* Detalle + leyenda */}
          <div className="idoc-insp-detail">
            <table className="idoc-table idoc-table--compact">
              <thead>
                <tr>
                  <th className="num">#</th>
                  <th>Pieza</th>
                  <th>Daño</th>
                  <th>Severidad</th>
                </tr>
              </thead>
              <tbody>
                {damages.map((d) => (
                  <tr key={d.number}>
                    <td className="num">{d.number} {d.typeLetter}</td>
                    <td>{d.partLabel}</td>
                    <td>{d.typeLabel}</td>
                    <td>{d.severityLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="idoc-insp-legend">
              <div className="idoc-insp-legend-title">Tipo de daño</div>
              <ul>
                {DAMAGE_TYPES.map((t) => (
                  <li key={t.id}>
                    <strong>{t.letter}</strong> = {t.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
