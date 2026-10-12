/**
 * Mapa de daños para el documento compacto A4.
 * Usa los MISMOS PNG y las MISMAS coordenadas normalizadas (x,y en 0–1) que la
 * app. Marcadores numerados legibles en blanco y negro.
 */

import { DAMAGE_TYPES, type VehicleView } from "@/lib/vehicle-damage/catalog";
import { VEHICLE_IMAGES, toPercent } from "@/lib/vehicle-damage/images";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";

const VIEW_LABELS: Record<VehicleView, string> = {
  left: "Lateral izquierdo",
  right: "Lateral derecho",
  front: "Frontal",
  rear: "Trasera",
  top: "Superior",
};

type PrintDamage = ReceptionPrintData["damages"][number];

function View({
  view,
  damages,
  variant,
}: {
  view: VehicleView;
  damages: PrintDamage[];
  variant: "wide" | "small";
}) {
  const viewDamages = damages.filter((d) => d.view === view);
  return (
    <div className={`rdoc-dmg-view rdoc-dmg-view--${variant}`}>
      <div className="rdoc-dmg-view-label">{VIEW_LABELS[view]}</div>
      <div className="rdoc-dmg-img-wrap">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={VEHICLE_IMAGES[view]} alt={VIEW_LABELS[view]} className="rdoc-dmg-img" />
        {viewDamages.map((d) => (
          <span
            key={d.number}
            className="rdoc-dmg-marker"
            style={{ left: toPercent(d.x), top: toPercent(d.y) }}
          >
            {d.number}
          </span>
        ))}
      </div>
    </div>
  );
}

export function ReceptionDamageMap({ data }: { data: ReceptionPrintData }) {
  const damages = data.damages;

  return (
    <section className="rdoc-section rdoc-damage">
      <h2 className="rdoc-section-title">Daños / condición exterior del vehículo</h2>

      {damages.length === 0 ? (
        <p className="rdoc-damage-empty">
          Sin daños exteriores registrados durante la recepción.
        </p>
      ) : (
        <>
          {/* Fila 1: laterales grandes + leyenda Tipo de daño */}
          <div className="rdoc-dmg-top">
            <View view="left" damages={damages} variant="wide" />
            <View view="right" damages={damages} variant="wide" />
            <div className="rdoc-dmg-legend">
              <div className="rdoc-dmg-legend-title">Tipo de daño</div>
              <ul>
                {DAMAGE_TYPES.map((t) => (
                  <li key={t.id}>
                    <strong>{t.letter}</strong> {t.label}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Fila 2: frontal/trasera/superior pequeños */}
          <div className="rdoc-dmg-bottom">
            <View view="front" damages={damages} variant="small" />
            <View view="rear" damages={damages} variant="small" />
            <View view="top" damages={damages} variant="small" />
          </div>
        </>
      )}
    </section>
  );
}
