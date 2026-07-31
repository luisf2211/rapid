"use client";

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
 * Input visual de nivel de combustible estilo medidor con aguja.
 * El usuario toca/clica un segmento del arco para seleccionar el nivel.
 */
export function FuelGaugeInput({
  value,
  onChange,
  label,
  error,
}: FuelGaugeInputProps) {
  const currentOption =
    FUEL_OPTIONS.find((o) => o.value === value) ?? FUEL_OPTIONS[2];

  const needleAngle = currentOption.angle;

  return (
    <div>
      {label && (
        <label className="form-label">{label}</label>
      )}
      <div className="flex flex-col items-center">
        <div className="relative w-[180px] h-[110px]">
          <svg
            viewBox="0 0 200 120"
            className="w-full h-full"
            role="group"
            aria-label="Medidor de combustible"
          >
            {/* Arco de fondo */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth={12}
              strokeLinecap="round"
            />

            {/* Segmentos coloreados del arco */}
            {FUEL_OPTIONS.map((option, idx) => {
              const isActive = value === option.value;
              const startAngle = -180 + idx * 36;
              const endAngle = startAngle + 36;
              const r = 80;
              const cx = 100;
              const cy = 100;

              const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180);
              const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180);
              const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180);
              const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180);

              const segmentColor = isActive
                ? idx <= 1
                  ? "#ef4444" // rojo para vacío/cuarto
                  : idx === 2
                    ? "#f59e0b" // ámbar para medio
                    : "#22c55e" // verde para 3/4 y lleno
                : "#e5e7eb";

              return (
                <path
                  key={option.value}
                  d={`M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={segmentColor}
                  strokeWidth={12}
                  strokeLinecap="butt"
                  className="cursor-pointer transition-colors"
                  onClick={() => onChange(option.value)}
                  role="button"
                  aria-label={option.description}
                  aria-pressed={isActive}
                />
              );
            })}

            {/* Marcas de texto E y F */}
            <text
              x="28"
              y="108"
              fontSize="11"
              fontWeight="700"
              fill="#6b7280"
              textAnchor="middle"
            >
              E
            </text>
            <text
              x="172"
              y="108"
              fontSize="11"
              fontWeight="700"
              fill="#6b7280"
              textAnchor="middle"
            >
              F
            </text>

            {/* Líneas de graduación */}
            {FUEL_OPTIONS.map((option) => {
              const angle = -90 + option.angle;
              const r1 = 65;
              const r2 = 72;
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
                />
              );
            })}

            {/* Aguja */}
            <g
              transform={`rotate(${needleAngle}, 100, 100)`}
              className="transition-transform duration-300 ease-out"
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="32"
                stroke="#1f2937"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
              {/* Punta de la aguja */}
              <polygon
                points="97,38 103,38 100,28"
                fill="#1f2937"
              />
            </g>

            {/* Centro de la aguja */}
            <circle cx="100" cy="100" r="6" fill="#374151" />
            <circle cx="100" cy="100" r="3" fill="#6b7280" />
          </svg>
        </div>

        {/* Botones de selección rápida debajo */}
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
      {error && <p className="mt-1 text-xs text-rapid-error text-center">{error}</p>}
    </div>
  );
}
