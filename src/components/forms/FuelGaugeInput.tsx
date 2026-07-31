"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const FUEL_OPTIONS = [
  { value: "EMPTY", label: "E", angle: -72, description: "Vacío" },
  { value: "QUARTER", label: "1/4", angle: -36, description: "1/4" },
  { value: "HALF", label: "1/2", angle: 0, description: "1/2" },
  { value: "THREE_QUARTERS", label: "3/4", angle: 36, description: "3/4" },
  { value: "FULL", label: "F", angle: 72, description: "Lleno" },
] as const;

interface FuelGaugeInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

/**
 * Calcula el ángulo (en grados, 0 = arriba/12 o'clock) desde el centro del
 * gauge hasta la posición del puntero, y lo mapea al nivel más cercano.
 */
function angleFromPointer(
  clientX: number,
  clientY: number,
  svgEl: SVGSVGElement,
): number {
  const rect = svgEl.getBoundingClientRect();
  // Centro del gauge en coordenadas de pantalla (cx=100, cy=100 en viewBox 200x120)
  const centerX = rect.left + rect.width * 0.5;
  const centerY = rect.top + rect.height * (100 / 120);

  const dx = clientX - centerX;
  const dy = clientY - centerY;

  // atan2 devuelve radianes desde el eje X positivo.
  // Convertimos a grados donde 0° = arriba (eje Y negativo)
  let deg = Math.atan2(dx, -dy) * (180 / Math.PI);

  // Clamp al rango del gauge: -72 a +72
  if (deg < -72) deg = -72;
  if (deg > 72) deg = 72;

  return deg;
}

function closestFuelValue(angleDeg: number): string {
  let closest = FUEL_OPTIONS[0];
  let minDist = Math.abs(angleDeg - closest.angle);

  for (const opt of FUEL_OPTIONS) {
    const dist = Math.abs(angleDeg - opt.angle);
    if (dist < minDist) {
      minDist = dist;
      closest = opt;
    }
  }
  return closest.value;
}

/**
 * Input visual de nivel de combustible estilo medidor con aguja arrastrable.
 * El usuario arrastra la aguja o toca un segmento/botón para seleccionar.
 */
export function FuelGaugeInput({
  value,
  onChange,
  label,
  error,
}: FuelGaugeInputProps) {
  const currentOption =
    FUEL_OPTIONS.find((o) => o.value === value) ?? FUEL_OPTIONS[2];
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);
  const [liveAngle, setLiveAngle] = useState<number | null>(null);

  const needleAngle = dragging && liveAngle != null ? liveAngle : currentOption.angle;

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!svgRef.current) return;
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDragging(true);
      const angle = angleFromPointer(e.clientX, e.clientY, svgRef.current);
      setLiveAngle(angle);
    },
    [],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      const angle = angleFromPointer(e.clientX, e.clientY, svgRef.current);
      setLiveAngle(angle);
    },
    [dragging],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !svgRef.current) return;
      (e.target as Element).releasePointerCapture(e.pointerId);
      setDragging(false);
      const angle = angleFromPointer(e.clientX, e.clientY, svgRef.current);
      const newValue = closestFuelValue(angle);
      setLiveAngle(null);
      onChange(newValue);
    },
    [dragging, onChange],
  );

  const handleArcClick = useCallback(
    (optionValue: string) => {
      if (!dragging) onChange(optionValue);
    },
    [dragging, onChange],
  );

  return (
    <div>
      {label && <label className="form-label">{label}</label>}
      <div className="flex flex-col items-center">
        <div className="relative w-[200px] h-[120px] select-none touch-none">
          <svg
            ref={svgRef}
            viewBox="0 0 200 120"
            className="w-full h-full"
            role="group"
            aria-label="Medidor de combustible"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ cursor: dragging ? "grabbing" : "default" }}
          >
            {/* Arco de fondo */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={14}
              strokeLinecap="round"
            />

            {/* Segmentos coloreados del arco */}
            {FUEL_OPTIONS.map((option, idx) => {
              const isActive = value === option.value;
              const isAtOrBelow =
                FUEL_OPTIONS.findIndex((o) => o.value === value) >= idx;
              const startAngle = -180 + idx * 36;
              const endAngle = startAngle + 36;
              const r = 80;
              const cx = 100;
              const cy = 100;

              const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
              const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
              const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
              const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

              const segmentColor = isAtOrBelow
                ? idx <= 1
                  ? "#ef4444"
                  : idx === 2
                    ? "#f59e0b"
                    : "#22c55e"
                : "#f3f4f6";

              return (
                <path
                  key={option.value}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={segmentColor}
                  strokeWidth={14}
                  strokeLinecap="butt"
                  className="cursor-grab active:cursor-grabbing"
                  onClick={() => handleArcClick(option.value)}
                  aria-label={option.description}
                />
              );
            })}

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

            {/* Líneas de graduación */}
            {FUEL_OPTIONS.map((option) => {
              const angle = -90 + option.angle;
              const r1 = 62;
              const r2 = 70;
              const cx = 100;
              const cy = 100;
              const x1 = cx + r1 * Math.cos((angle * Math.PI) / 180);
              const y1 = cy + r1 * Math.sin((angle * Math.PI) / 180);
              const x2 = cx + r2 * Math.cos((angle * Math.PI) / 180);
              const y2 = cy + r2 * Math.sin((angle * Math.PI) / 180);

              return (
                <line
                  key={option.value}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#9ca3af"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  className="pointer-events-none"
                />
              );
            })}

            {/* Aguja (arrastrable) */}
            <g
              transform={`rotate(${needleAngle}, 100, 100)`}
              className={cn(
                "pointer-events-none",
                !dragging && "transition-transform duration-300 ease-out",
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

            {/* Zona interactiva de la aguja (invisible, más grande para facilitar el drag) */}
            <g transform={`rotate(${needleAngle}, 100, 100)`}>
              <rect
                x="92"
                y="24"
                width="16"
                height="78"
                fill="transparent"
                className="cursor-grab active:cursor-grabbing"
              />
            </g>

            {/* Centro */}
            <circle
              cx="100"
              cy="100"
              r="7"
              fill="#374151"
              className="pointer-events-none"
            />
            <circle
              cx="100"
              cy="100"
              r="3.5"
              fill="#6b7280"
              className="pointer-events-none"
            />

            {/* Label del nivel actual */}
            <text
              x="100"
              y="88"
              fontSize="12"
              fontWeight="700"
              fill="#374151"
              textAnchor="middle"
              className="pointer-events-none"
            >
              {currentOption.description}
            </text>
          </svg>
        </div>

        {/* Botones de selección rápida */}
        <div
          role="radiogroup"
          aria-label="Nivel de combustible"
          className="flex items-center gap-1 mt-1"
        >
          {FUEL_OPTIONS.map((option) => {
            const isActive = value === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isActive}
                aria-label={option.description}
                title={option.description}
                onClick={() => onChange(option.value)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-semibold transition-colors",
                  isActive
                    ? "bg-rapid-green text-white"
                    : "bg-rapid-surface-soft text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface",
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-rapid-error text-center">{error}</p>
      )}
    </div>
  );
}
