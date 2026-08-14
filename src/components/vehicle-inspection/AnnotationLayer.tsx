"use client";

import type { VehicleAnnotation } from "./types";

interface AnnotationLayerProps {
  annotations: VehicleAnnotation[];
  viewBoxW: number;
  viewBoxH: number;
}

/**
 * Renderiza las anotaciones como elementos SVG sobre la silueta del vehículo.
 * Cada anotación se posiciona con coordenadas porcentuales convertidas a viewBox.
 */
export function AnnotationLayer({ annotations, viewBoxW, viewBoxH }: AnnotationLayerProps) {
  return (
    <g className="annotation-layer">
      {annotations.map((ann) => {
        const cx = (ann.x / 100) * viewBoxW;
        const cy = (ann.y / 100) * viewBoxH;
        const key = ann.id;

        switch (ann.tool) {
          case "crossMark":
            return (
              <g key={key}>
                <line
                  x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8}
                  stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round"
                />
                <line
                  x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8}
                  stroke="#dc2626" strokeWidth={2.5} strokeLinecap="round"
                />
              </g>
            );

          case "circle":
            return (
              <circle
                key={key}
                cx={cx} cy={cy} r={10}
                fill="none" stroke="#dc2626" strokeWidth={2}
              />
            );

          case "scratch": {
            const x2 = ann.x2 != null ? (ann.x2 / 100) * viewBoxW : cx + 30;
            const y2 = ann.y2 != null ? (ann.y2 / 100) * viewBoxH : cy;
            const midX = (cx + x2) / 2;
            const midY = (cy + y2) / 2;
            const offset = 6;
            return (
              <path
                key={key}
                d={`M ${cx} ${cy} Q ${midX} ${midY - offset} ${x2} ${y2}`}
                fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round"
                strokeDasharray="3 2"
              />
            );
          }

          case "arrow": {
            const x2 = ann.x2 != null ? (ann.x2 / 100) * viewBoxW : cx + 25;
            const y2 = ann.y2 != null ? (ann.y2 / 100) * viewBoxH : cy - 20;
            const angle = Math.atan2(y2 - cy, x2 - cx);
            const headLen = 7;
            const ax1 = x2 - headLen * Math.cos(angle - 0.5);
            const ay1 = y2 - headLen * Math.sin(angle - 0.5);
            const ax2 = x2 - headLen * Math.cos(angle + 0.5);
            const ay2 = y2 - headLen * Math.sin(angle + 0.5);
            return (
              <g key={key}>
                <line
                  x1={cx} y1={cy} x2={x2} y2={y2}
                  stroke="#dc2626" strokeWidth={2} strokeLinecap="round"
                />
                <polygon
                  points={`${x2},${y2} ${ax1},${ay1} ${ax2},${ay2}`}
                  fill="#dc2626"
                />
              </g>
            );
          }

          case "crack":
            return (
              <path
                key={key}
                d={`M ${cx} ${cy - 10} L ${cx + 3} ${cy - 4} L ${cx + 9} ${cy - 3} L ${cx + 5} ${cy + 2} L ${cx + 7} ${cy + 10} L ${cx} ${cy + 5} L ${cx - 7} ${cy + 10} L ${cx - 5} ${cy + 2} L ${cx - 9} ${cy - 3} L ${cx - 3} ${cy - 4} Z`}
                fill="none" stroke="#dc2626" strokeWidth={1.8} strokeLinejoin="round"
              />
            );

          case "text": {
            // Los números son internos: una anotación de texto sin contenido
            // se marca como un punto discreto en vez de mostrar "#n".
            if (!ann.text) {
              return (
                <circle key={key} cx={cx} cy={cy} r={3} fill="#dc2626" />
              );
            }
            return (
              <g key={key}>
                <rect
                  x={cx - 2} y={cy - 10} width={Math.max(ann.text.length * 6, 20)} height={14}
                  fill="white" fillOpacity={0.85} stroke="#dc2626" strokeWidth={0.8} rx={2}
                />
                <text x={cx + 1} y={cy + 1} fontSize={9} fontWeight={600} fill="#dc2626">
                  {ann.text}
                </text>
              </g>
            );
          }

          default:
            return null;
        }
      })}
    </g>
  );
}
