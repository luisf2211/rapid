import {
  ORDERED_SIDES,
  VIEW_DEFS,
  getZonesForRender,
} from "@/lib/vehicle-zones";
import { ZoneShapeEl } from "@/components/vehicle-diagram/ZoneShapeEl";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";

type PrintDamage = ReceptionPrintData["damages"][number];

/**
 * Figura de "Daños señalizados" para la impresión de la orden de recepción.
 * Renderiza las 5 vistas del vehículo (como la hoja de papel) resaltando en
 * negro las zonas con daño y su número. Pensado para B/N: solo usa fills SVG.
 */
export function DamageDiagramFigure({ damages }: { damages: PrintDamage[] }) {
  const markedZones = new Set(
    damages.filter((d) => d.hasMarker && d.zone != null).map((d) => d.zone),
  );

  return (
    <div className="idoc-damage-figure">
      {ORDERED_SIDES.map((side) => {
        const view = VIEW_DEFS[side];
        const zones = getZonesForRender(side);
        return (
          <div key={side} className={`idoc-damage-view idoc-damage-view--${side.toLowerCase()}`}>
            <svg
              viewBox={`0 0 ${view.viewBox.w} ${view.viewBox.h}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <g
                fill="none"
                stroke="#333"
                strokeWidth={1.4}
                strokeLinejoin="round"
                strokeLinecap="round"
              >
                {view.decor.map((shape, i) => (
                  <ZoneShapeEl key={i} shape={shape} />
                ))}
              </g>
              {zones.map((zone) => {
                const marked = markedZones.has(zone.zone);
                return (
                  <g key={zone.zone}>
                    <ZoneShapeEl
                      shape={zone.shape}
                      fill={marked ? "#333" : "#fff"}
                      stroke="#333"
                      strokeWidth={marked ? 1.6 : 1}
                    />
                    <text
                      x={zone.labelX}
                      y={zone.labelY}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={9}
                      fontWeight={700}
                      fill={marked ? "#fff" : "#999"}
                    >
                      {zone.zone}
                    </text>
                  </g>
                );
              })}
              {view.overlay.length > 0 && (
                <g
                  fill="none"
                  stroke="#555"
                  strokeWidth={0.9}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                >
                  {view.overlay.map((shape, i) => (
                    <ZoneShapeEl key={i} shape={shape} />
                  ))}
                </g>
              )}
            </svg>
            <div className="idoc-damage-view-label">{view.label}</div>
          </div>
        );
      })}
    </div>
  );
}
