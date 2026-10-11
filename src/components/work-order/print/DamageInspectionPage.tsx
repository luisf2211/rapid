/**
 * Sección de daños / condición exterior del vehículo para impresión.
 * Muestra las 5 vistas con marcadores numerados y una tabla de detalle.
 * Pensado para ser legible en blanco y negro (no depende del color).
 */

import {
  SILHOUETTE_COMPONENTS,
  VIEW_DIMENSIONS,
  VIEW_LABELS,
  type VehicleView,
} from "@/components/vehicle-inspection/VehicleSilhouettes";
import { DAMAGE_TYPES } from "@/lib/vehicle-damage/catalog";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";

const ALL_VIEWS: VehicleView[] = ["left", "right", "front", "back", "top"];

type PrintDamage = ReceptionPrintData["damages"][number];

interface DamageInspectionPageProps {
  data: ReceptionPrintData;
  orderNumber: string;
  customerName: string;
  plate: string | null;
}

/** Una vista del vehículo con sus marcadores numerados. */
function PrintView({
  view,
  damages,
}: {
  view: VehicleView;
  damages: PrintDamage[];
}) {
  const dims = VIEW_DIMENSIONS[view];
  const Silhouette = SILHOUETTE_COMPONENTS[view];
  const viewDamages = damages.filter((d) => d.view === view);

  return (
    <div className="idoc-inspection-view">
      <div
        className="idoc-inspection-svg-wrap"
        style={{ position: "relative", aspectRatio: `${dims.w} / ${dims.h}` }}
      >
        <Silhouette
          className="idoc-inspection-silhouette"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        {viewDamages.map((d) => (
          <div
            key={d.number}
            className="idoc-damage-marker"
            style={{
              position: "absolute",
              left: `${d.x}%`,
              top: `${d.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {d.number}
            <span className="idoc-damage-marker-letter">{d.typeLetter}</span>
          </div>
        ))}
      </div>
      <div className="idoc-inspection-view-label">{VIEW_LABELS[view]}</div>
    </div>
  );
}

export function DamageInspectionPage({
  data,
  orderNumber,
}: DamageInspectionPageProps) {
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
          {/* Diagramas: 3 arriba, 2 abajo */}
          <div className="idoc-inspection-row-3">
            <PrintView view="left" damages={damages} />
            <PrintView view="right" damages={damages} />
            <PrintView view="top" damages={damages} />
          </div>
          <div className="idoc-inspection-row-3">
            <PrintView view="front" damages={damages} />
            <PrintView view="back" damages={damages} />
            <div className="idoc-inspection-legend">
              <div className="idoc-inspection-legend-title">Leyenda</div>
              <ul>
                {DAMAGE_TYPES.map((t) => (
                  <li key={t.id}>
                    <strong>{t.letter}</strong> = {t.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tabla de detalle */}
          <table className="idoc-table idoc-table--compact" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th className="num">#</th>
                <th>Área / Pieza</th>
                <th>Tipo de daño</th>
                <th>Severidad</th>
              </tr>
            </thead>
            <tbody>
              {damages.map((d) => (
                <tr key={d.number}>
                  <td className="num">
                    {d.number} {d.typeLetter}
                  </td>
                  <td>{d.partLabel}</td>
                  <td>{d.typeLabel}</td>
                  <td>{d.severityLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
