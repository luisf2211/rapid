import {
  VIEW_DEFS,
  getZonesForRender,
  type VehicleSide,
} from "@/lib/vehicle-zones";
import { ZoneShapeEl } from "@/components/vehicle-diagram/ZoneShapeEl";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";

type PrintDamage = ReceptionPrintData["damages"][number];

/**
 * Renderiza una vista individual del vehículo como SVG.
 */
function VehicleView({
  side,
  markedZones,
}: {
  side: VehicleSide;
  markedZones: Set<number | null>;
}) {
  const view = VIEW_DEFS[side];
  const zones = getZonesForRender(side);

  return (
    <div className={`idoc-damage-view idoc-damage-view--${side.toLowerCase()}`}>
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
                fill={marked ? "#000" : "#fff"}
                stroke="#000"
                strokeWidth={marked ? 2 : 1}
              />
              <text
                x={zone.labelX}
                y={zone.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={marked ? 10 : 9}
                fontWeight={700}
                fill={marked ? "#fff" : "#aaa"}
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
}

/**
 * Figura de "Daños señalizados" para la impresión de la orden de recepción.
 * Layout simétrico:
 *   Fila 1: Frente | Atrás (mismo tamaño, lado a lado)
 *   Fila 2: Izquierda (ancho completo)
 *   Fila 3: Derecha (ancho completo, mismo tamaño)
 *   Fila 4: Techo (centrado)
 */
export function DamageDiagramFigure({ damages }: { damages: PrintDamage[] }) {
  const markedZones = new Set(
    damages.filter((d) => d.hasMarker && d.zone != null).map((d) => d.zone),
  );

  return (
    <div className="idoc-damage-figure">
      {/* Frente y Atrás — simétricos, mismo tamaño */}
      <div className="idoc-damage-row-pair">
        <VehicleView side="FRONT" markedZones={markedZones} />
        <VehicleView side="BACK" markedZones={markedZones} />
      </div>

      {/* Laterales — mismo ancho, uno debajo del otro */}
      <VehicleView side="LEFT" markedZones={markedZones} />
      <VehicleView side="RIGHT" markedZones={markedZones} />

      {/* Techo — centrado */}
      <VehicleView side="TOP" markedZones={markedZones} />
    </div>
  );
}
