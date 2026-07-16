import type { SVGProps } from "react";
import type { ZoneShape } from "@/lib/vehicle-zones";

/**
 * Renderiza un `ZoneShape` como elemento SVG. Módulo sin "use client":
 * lo usan tanto el componente interactivo como el documento de impresión.
 */
export function ZoneShapeEl({
  shape,
  ...rest
}: { shape: ZoneShape } & SVGProps<SVGRectElement & SVGCircleElement & SVGPathElement>) {
  if (shape.type === "rect") {
    return (
      <rect
        x={shape.x}
        y={shape.y}
        width={shape.w}
        height={shape.h}
        rx={shape.rx ?? 3}
        {...rest}
      />
    );
  }
  if (shape.type === "circle") {
    return <circle cx={shape.cx} cy={shape.cy} r={shape.r} {...rest} />;
  }
  return <path d={shape.d} {...rest} />;
}
