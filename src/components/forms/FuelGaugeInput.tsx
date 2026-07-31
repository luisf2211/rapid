"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface FuelGaugeInputProps {
  /** Porcentaje 0-100 */
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
}

/** Ángulo mínimo y máximo de la aguja (grados, 0 = arriba) */
const MIN_ANGLE = -72;
const MAX_ANGLE = 72;
const ANGLE_RANGE = MAX_ANGLE - MIN_ANGLE; // 144°

function percentToAngle(percent: number): number {
  return MIN_ANGLE + (percent / 100) * ANGLE_RANGE;
}

function angleToPercent(angle: number): number {
  const clamped = Math.max(MIN_ANGLE, Math.min(MAX_ANGLE, angle));
  return Math.round(((clamped - MIN_ANGLE) / ANGLE_RANGE) * 100);
}

/**
 * Calcula el ángulo desde el centro del gauge hasta el puntero.
 */
function angleFromPointer(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement,
): number {
  const rect = svgEl.getBoundingClientRect();
  const centerX = rect.left + rect.width * 0.5;
  const centerY = rect.top + rect.height * (100 / 120);

  const dx = clientX - centerX;
  const dy = clientY - centerY;

  let deg = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (deg < MIN_ANGLE) deg = MIN_ANGLE;
  if (deg > MAX_ANGLE) deg = MAX_ANGLE;

  return deg;
}

/** Color del arco según el porcentaje llenado */
function arcColor(fillPercent: number): string {
  if (fillPercent <= 25) return "#ef4444";
  if (fillPercent <= 50) return "#f59e0b";
  return "#22c55e";
}

/**
 * Input visual de nivel de combustible — porcentaje libre (0-100%).
 * La aguja se arrastra libremente sobre el arco semicircular.
 */
export function FuelGaugeInput({
  value,
  onChange,
  label,
  error,
}: FuelGaugeInputProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [livePercent, setLivePercent] = useState<number | null>(null);

  const displayPercent = dragging && livePercent != null ? livePercent : value;
  const needleAngle = percentToAngle(displayPercent);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!svgRef.current) return;
    e.preventDefault();
    (e.target as Element).setPointerCapture(e.pointerId);
    setDragging(true);
    const angle = angleFromPointer(e.clientX, e.clientY, svgRef.current);
    setLivePercent(angleToPercent(angle));
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      const angle = angleFromPointer(e.clientX, e.clientY, svgRef.current);
      setLivePercent(angleToPercent(angle));
    },
    [dragging],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      (e.target as Element).releasePointerCapture(e.pointerId);
      setDragging(false);
      const angle = angleFromPointer(e.clientX, e.clientY, svgRef.current);
      const pct = angleToPercent(angle);
      setLivePercent(null);
      onChange(pct);
    },
    [dragging, onChange],
  );

  // Arco de "lleno" proporcional al porcentaje
  const filledStartAngle = -180; // grados SVG (eje X)
  const filledSweep = (displayPercent / 100) * 180;
  const filledEndAngle = filledStartAngle + filledSweep;
  const r = 80;
  const cx = 100;
  const cy = 100;
  const x1 = cx + r * Math.cos((filledStartAngle * Math.PI) / 180);
  const y1 = cy + r * Math.sin((filledStartAngle * Math.PI) / 180);
  const x2 = cx + r * Math.cos((filledEndAngle * Math.PI) / 180);
  const y2 = cy + r * Math.sin((filledEndAngle * Math.PI) / 180);
  const largeArc = filledSweep > 90 ? 1 : 0;

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div className="flex flex-col items-center">
        <div className="relative w-[200px] h-[120px] select-none touch-none">
          <svg
            ref={svgRef}
            viewBox="0 0 200 120"
            className="w-full h-full"
            role="slider"
            aria-label="Nivel de combustible"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={displayPercent}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: dragging ? "grabbing" : "grab" }}
          >
            {/* Arco de fondo (vacío) */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={14}
              strokeLinecap="round"
            />

            {/* Arco llenado (proporcional al %) */}
            {displayPercent > 0 && (
              <path
                d={`M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={arcColor(displayPercent)}
                strokeWidth={14}
                strokeLinecap="round"
              />
            )}

            {/* Marcas E y F */}
            <text
              x="24"
              y="112"
              fontSize="11"
              fontWeight="700"
              fill="#6b7280"
              textAnchor="middle"
              className="pointer-events-none"
            >
              E
            </text>
            <text
              x="176"
              y="112"
              fontSize="11"
              fontWeight="700"
              fill="#6b7280"
              textAnchor="middle"
              className="pointer-events-none"
            >
              F
            </text>

            {/* Graduaciones (0, 25, 50, 75, 100) */}
            {[0, 25, 50, 75, 100].map((pct) => {
              const a = -90 + percentToAngle(pct);
              const r1a = 62;
              const r2a = 70;
              const lx1 = cx + r1a * Math.cos((a * Math.PI) / 180);
              const ly1 = cy + r1a * Math.sin((a * Math.PI) / 180);
              const lx2 = cx + r2a * Math.cos((a * Math.PI) / 180);
              const ly2 = cy + r2a * Math.sin((a * Math.PI) / 180);
              return (
                <line
                  key={pct}
                  x1={lx1}
                  y1={ly1}
                  x2={lx2}
                  y2={ly2}
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              );
            })}

            {/* Aguja */}
            <g
              transform={`rotate(${needleAngle}, 100, 100)`}
              className={cn(
                "pointer-events-none",
                !dragging && "transition-transform duration-200 ease-out",
              )}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="30"
                stroke="#1f2937"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              <polygon points="97,36 103,36 100,26" fill="#1f2937" />
            </g>

            {/* Centro */}
            <circle cx="100" cy="100" r="7" fill="#374151" className="pointer-events-none" />
            <circle cx="100" cy="100" r="3.5" fill="#6b7280" className="pointer-events-none" />

            {/* Porcentaje */}
            <text
              x="100"
              y="86"
              fontSize="14"
              fontWeight="700"
              fill="#374151"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {displayPercent}%
            </text>
          </svg>
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-rapid-error text-center">{error}</p>
      )}
    </div>
  );
}
