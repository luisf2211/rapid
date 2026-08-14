/**
 * Página dedicada de daños señalizados para impresión.
 * Se renderiza como una hoja separada con las 5 vistas del vehículo y las
 * anotaciones posicionadas libremente: el marcado sobre el dibujo es la
 * información, sin tabla resumen que la duplique.
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

/* Columnas de la rejilla compacta (todas las vistas con alturas parecidas) */
const VIEWS_FACES: VehicleView[] = ["front", "back"];
const VIEWS_BODY: VehicleView[] = ["left", "right", "top"];

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
  // print-data ya rellenó la posición aproximada para daños legacy solo-zona.
  if (d.positionX == null || d.positionY == null) return null;
  return {
    id: `print_${index}`,
    view: (d.sideCode ?? "left") as VehicleView,
    tool: (d.annotationTool ?? "crossMark") as VehicleAnnotation["tool"],
    x: d.positionX,
    y: d.positionY,
    x2: d.positionX2 ?? undefined,
    y2: d.positionY2 ?? undefined,
    text: d.description !== "—" ? d.description || undefined : undefined,
    number: index + 1,
  };
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

      {/* Rejilla compacta: frente/atrás a la izquierda; laterales y techo a la derecha */}
      <div className="idoc-inspection-grid">
        <div className="idoc-inspection-col--faces">
          {VIEWS_FACES.map((view) => (
            <PrintView key={view} view={view} annotations={annotations} />
          ))}
        </div>
        <div className="idoc-inspection-col--body">
          {VIEWS_BODY.map((view) => (
            <PrintView key={view} view={view} annotations={annotations} />
          ))}
        </div>
      </div>
    </div>
  );
}
