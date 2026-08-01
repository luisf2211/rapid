/**
 * Página dedicada de daños señalizados para impresión.
 * Se renderiza como una hoja separada con las 5 vistas del vehículo
 * y las anotaciones posicionadas libremente, seguida de una tabla resumen.
 */

import {
  SILHOUETTE_COMPONENTS,
  VIEW_DIMENSIONS,
  VIEW_LABELS,
  type VehicleView,
} from "@/components/vehicle-inspection/VehicleSilhouettes";
import { AnnotationLayer } from "@/components/vehicle-inspection/AnnotationLayer";
import type { VehicleAnnotation } from "@/components/vehicle-inspection/types";
import type { ReceptionPrintData } from "@/lib/work-order/reception-print-data";
import { ANNOTATION_TOOLS } from "@/components/vehicle-inspection/types";

const VIEWS_ROW1: VehicleView[] = ["front", "back", "top"];
const VIEWS_ROW2: VehicleView[] = ["left", "right"];

interface DamageInspectionPageProps {
  data: ReceptionPrintData;
  orderNumber: string;
  customerName: string;
  plate: string | null;
}

function damageToAnnotation(
  d: ReceptionPrintData["damages"][number],
  index: number,
): VehicleAnnotation | null {
  if (d.positionX == null || d.positionY == null) return null;
  return {
    id: `print_${index}`,
    view: (d.side?.toLowerCase() ?? "left") as VehicleView,
    tool: (d.annotationTool ?? "crossMark") as VehicleAnnotation["tool"],
    x: d.positionX,
    y: d.positionY,
    x2: d.positionX2 ?? undefined,
    y2: d.positionY2 ?? undefined,
    text: d.description || undefined,
    number: index + 1,
  };
}

function toolLabel(tool: string): string {
  return ANNOTATION_TOOLS.find((t) => t.tool === tool)?.label ?? tool;
}

/** Renderiza una vista del vehículo con sus anotaciones para impresión */
function PrintView({
  view,
  annotations,
}: {
  view: VehicleView;
  annotations: VehicleAnnotation[];
}) {
  const dims = VIEW_DIMENSIONS[view];
  const SilhouetteComponent = SILHOUETTE_COMPONENTS[view];
  const viewAnnotations = annotations.filter((a) => a.view === view);

  return (
    <div className="idoc-inspection-view">
      <div className="idoc-inspection-svg-wrap" style={{ aspectRatio: `${dims.w} / ${dims.h}` }}>
        <SilhouetteComponent
          className="idoc-inspection-silhouette"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        />
        <svg
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <AnnotationLayer
            annotations={viewAnnotations}
            viewBoxW={dims.w}
            viewBoxH={dims.h}
          />
        </svg>
      </div>
      <div className="idoc-inspection-view-label">{VIEW_LABELS[view]}</div>
    </div>
  );
}

export function DamageInspectionPage({
  data,
  orderNumber,
  customerName,
  plate,
}: DamageInspectionPageProps) {
  const annotations = data.damages
    .map((d, i) => damageToAnnotation(d, i))
    .filter((a): a is VehicleAnnotation => a != null);

  if (annotations.length === 0 && data.damages.length === 0) return null;

  return (
    <div className="idoc-inspection-page">
      {/* Mini header */}
      <div className="idoc-inspection-header">
        <div className="idoc-inspection-header-title">
          Inspección de daños — {orderNumber}
        </div>
        <div className="idoc-inspection-header-meta">
          {customerName} {plate ? `· ${plate}` : ""}
        </div>
      </div>

      {/* Vistas Fila 1: Frente, Atrás, Techo */}
      <div className="idoc-inspection-row-3">
        {VIEWS_ROW1.map((view) => (
          <PrintView key={view} view={view} annotations={annotations} />
        ))}
      </div>

      {/* Vistas Fila 2: Izquierda, Derecha (ancho completo) */}
      <div className="idoc-inspection-row-full">
        {VIEWS_ROW2.map((view) => (
          <PrintView key={view} view={view} annotations={annotations} />
        ))}
      </div>

      {/* Tabla de daños */}
      {data.damages.length > 0 && (
        <table className="idoc-table idoc-table--compact" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th className="num">#</th>
              <th>Vista</th>
              <th>Tipo</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            {data.damages.map((d, i) => (
              <tr key={i}>
                <td className="num">{i + 1}</td>
                <td>{d.side}</td>
                <td>{d.annotationTool ? toolLabel(d.annotationTool) : d.type}</td>
                <td>{d.description || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
