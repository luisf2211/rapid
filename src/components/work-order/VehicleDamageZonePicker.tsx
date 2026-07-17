"use client";

import { useState } from "react";
import { Trash2, X, MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { DAMAGE_TYPES } from "@/lib/constants";
import type { DamageInput } from "@/lib/validations/work-order";
import {
  ORDERED_SIDES,
  VIEW_DEFS,
  VEHICLE_ZONE_MAP,
  getZonesBySide,
  getZonesForRender,
  type VehicleSide,
  type VehicleZone,
} from "@/lib/vehicle-zones";
import { ZoneShapeEl } from "@/components/vehicle-diagram/ZoneShapeEl";

const typeLabel = (v: string) =>
  DAMAGE_TYPES.find((t) => t.value === v)?.label ?? v;

interface Props {
  value: DamageInput[];
  onChange: (next: DamageInput[]) => void;
}

export function VehicleDamageZonePicker({ value, onChange }: Props) {
  const [activeSide, setActiveSide] = useState<VehicleSide>("FRONT");
  const [selectedZone, setSelectedZone] = useState<number | null>(null);
  // Índice de un daño legacy (sin zona) en espera de ubicación.
  const [locatingIdx, setLocatingIdx] = useState<number | null>(null);

  const view = VIEW_DEFS[activeSide];
  const zones = getZonesBySide(activeSide);

  const indexByZone = (zone: number) =>
    value.findIndex((d) => d.zoneNumber === zone);

  const countBySide = (side: VehicleSide) =>
    value.filter((d) => d.zoneNumber != null && VEHICLE_ZONE_MAP[d.zoneNumber]?.side === side)
      .length;

  const legacyDamages = value
    .map((d, idx) => ({ d, idx }))
    .filter(({ d }) => d.zoneNumber == null || !VEHICLE_ZONE_MAP[d.zoneNumber]);

  function selectZone(zone: VehicleZone) {
    // Modo "ubicar": asignar la zona a un daño legacy pendiente.
    if (locatingIdx != null) {
      const next = value.map((d, i) =>
        i === locatingIdx
          ? { ...d, zoneNumber: zone.zone, vehicleSide: zone.side, positionX: undefined, positionY: undefined }
          : d,
      );
      onChange(next);
      setLocatingIdx(null);
      setSelectedZone(zone.zone);
      return;
    }

    const existing = indexByZone(zone.zone);
    if (existing >= 0) {
      // Segundo toque sobre la zona ya seleccionada → se elimina (toggle rápido).
      if (selectedZone === zone.zone) {
        removeByIndex(existing);
        return;
      }
      // Zona marcada pero no seleccionada → solo abrir su editor.
      setSelectedZone(zone.zone);
      return;
    }
    // Nueva marca con el tipo más común por defecto (Rayón).
    onChange([
      ...value,
      {
        vehicleSide: zone.side,
        damageType: "SCRATCH",
        description: "",
        zoneNumber: zone.zone,
      },
    ]);
    setSelectedZone(zone.zone);
  }

  function patchZone(zone: number, patch: Partial<DamageInput>) {
    onChange(value.map((d) => (d.zoneNumber === zone ? { ...d, ...patch } : d)));
  }

  function removeByIndex(idx: number) {
    const removed = value[idx];
    onChange(value.filter((_, i) => i !== idx));
    if (removed?.zoneNumber === selectedZone) setSelectedZone(null);
    if (idx === locatingIdx) setLocatingIdx(null);
  }

  function zoneState(zone: number): "normal" | "damaged" | "selected" {
    if (zone === selectedZone) return "selected";
    return indexByZone(zone) >= 0 ? "damaged" : "normal";
  }

  const selectedDamage =
    selectedZone != null
      ? value.find((d) => d.zoneNumber === selectedZone) ?? null
      : null;
  const selectedZoneDef =
    selectedZone != null ? VEHICLE_ZONE_MAP[selectedZone] : null;

  const markedCount = value.filter(
    (d) => d.zoneNumber != null && VEHICLE_ZONE_MAP[d.zoneNumber],
  ).length;

  return (
    <div className="space-y-4">
      {/* Selector de vista */}
      <div
        className="grid grid-cols-3 sm:grid-cols-5 gap-2"
        role="tablist"
        aria-label="Vistas del vehículo"
      >
        {ORDERED_SIDES.map((side) => {
          const active = side === activeSide;
          const count = countBySide(side);
          return (
            <button
              key={side}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveSide(side);
                setSelectedZone(null);
              }}
              className={cn(
                "relative min-h-11 rounded-lg border px-2 py-2 text-sm font-semibold transition-colors",
                active
                  ? "border-rapid-green bg-rapid-green-soft text-rapid-black"
                  : "border-rapid-border bg-white text-rapid-text-muted hover:border-rapid-green",
              )}
            >
              {VIEW_DEFS[side].label}
              {count > 0 && (
                <span
                  className={cn(
                    "absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold text-white",
                    "bg-rapid-error",
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Banner modo ubicar */}
      {locatingIdx != null && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-rapid-green bg-rapid-green-soft px-3 py-2 text-sm">
          <span className="flex items-center gap-2 font-semibold text-rapid-black">
            <MapPin className="h-4 w-4" />
            Toca una zona para ubicar el daño
          </span>
          <button
            type="button"
            onClick={() => setLocatingIdx(null)}
            className="text-xs font-semibold text-rapid-text-muted hover:text-rapid-black"
          >
            Cancelar
          </button>
        </div>
      )}

      {/* Diagrama */}
      <div className={cn("mx-auto w-full", view.maxWidthClass)}>
        <svg
          viewBox={`0 0 ${view.viewBox.w} ${view.viewBox.h}`}
          className="w-full touch-manipulation select-none"
          style={{ aspectRatio: `${view.viewBox.w} / ${view.viewBox.h}` }}
          role="group"
          aria-label={`Diagrama ${view.label}`}
        >
          {/* Decoración (silueta) */}
          <g fill="none" stroke="#cbd5e1" strokeWidth={1.4} strokeLinejoin="round" strokeLinecap="round" pointerEvents="none">
            {view.decor.map((shape, i) => (
              <ZoneShapeEl key={i} shape={shape} />
            ))}
          </g>

          {/* Zonas (orden por área: grandes debajo, pequeñas encima) */}
          {getZonesForRender(activeSide).map((zone) => {
            const state = zoneState(zone.zone);
            const fill =
              state === "selected"
                ? "#fca5a5"
                : state === "damaged"
                  ? "#fecaca"
                  : "#f1f5f9";
            const stroke =
              state === "normal" ? "#cbd5e1" : state === "selected" ? "#00c853" : "#dc2626";
            const textColor = state === "normal" ? "#64748b" : "#b91c1c";
            return (
              <g key={zone.zone} className="cursor-pointer">
                <ZoneShapeEl
                  shape={zone.shape}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={state === "selected" ? 3 : state === "damaged" ? 1.8 : 1.2}
                  className="transition-colors"
                  onClick={() => selectZone(zone)}
                />
                <text
                  x={zone.labelX}
                  y={zone.labelY}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={9}
                  fontWeight={700}
                  fill={textColor}
                  pointerEvents="none"
                >
                  {zone.zone}
                </text>
              </g>
            );
          })}

          {/* Detalles encima de las zonas (manijas, aros, placa...) */}
          {view.overlay.length > 0 && (
            <g
              fill="none"
              stroke="#94a3b8"
              strokeWidth={1.2}
              strokeLinejoin="round"
              strokeLinecap="round"
              pointerEvents="none"
            >
              {view.overlay.map((shape, i) => (
                <ZoneShapeEl key={i} shape={shape} />
              ))}
            </g>
          )}

          {/* Áreas táctiles ampliadas para zonas pequeñas */}
          {getZonesForRender(activeSide)
            .filter((z) => z.hitShape)
            .map((zone) => (
              <ZoneShapeEl
                key={`hit-${zone.zone}`}
                shape={zone.hitShape!}
                fill="transparent"
                stroke="none"
                className="cursor-pointer"
                onClick={() => selectZone(zone)}
              />
            ))}
        </svg>
      </div>

      <p className="text-center text-xs text-rapid-text-muted">
        Toca una zona para marcar el daño; tócala de nuevo para quitarla
      </p>

      {/* Chips de zonas de la vista (precisión táctil garantizada) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {zones.map((zone) => {
          const damaged = indexByZone(zone.zone) >= 0;
          return (
            <button
              key={zone.zone}
              type="button"
              onClick={() => selectZone(zone)}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors",
                zone.zone === selectedZone
                  ? "border-rapid-green ring-1 ring-rapid-green bg-rapid-green-soft"
                  : damaged
                    ? "border-red-300 bg-red-50"
                    : "border-rapid-border bg-white hover:border-rapid-green",
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold",
                  damaged ? "bg-rapid-error text-white" : "bg-rapid-surface-strong text-rapid-text-muted",
                )}
              >
                {zone.zone}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-rapid-text">
                {zone.short}
              </span>
              {damaged && <Check className="h-4 w-4 shrink-0 text-rapid-error" />}
            </button>
          );
        })}
      </div>

      {/* Editor inline de la zona seleccionada */}
      {selectedDamage && selectedZoneDef && (
        <div className="rounded-lg border border-rapid-green bg-rapid-green-soft/40 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-rapid-black">
              <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-rapid-error text-[11px] font-bold text-white">
                {selectedZoneDef.zone}
              </span>
              {selectedZoneDef.name}
            </p>
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              aria-label="Cerrar"
              className="flex h-8 w-8 items-center justify-center rounded-full text-rapid-text-muted hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-rapid-text-muted">
              Tipo de daño
            </p>
            <div className="flex flex-wrap gap-1.5">
              {DAMAGE_TYPES.map((t) => {
                const active = selectedDamage.damageType === t.value;
                return (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() =>
                      patchZone(selectedZoneDef.zone, {
                        damageType: t.value as DamageInput["damageType"],
                      })
                    }
                    className={cn(
                      "min-h-9 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "border-rapid-black bg-rapid-black text-white"
                        : "border-rapid-border bg-white text-rapid-text-body hover:border-rapid-black",
                    )}
                  >
                    {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="form-label" htmlFor="zone-desc">
              Descripción
            </label>
            <input
              id="zone-desc"
              className="form-input"
              placeholder="Detalle del daño (opcional)..."
              value={selectedDamage.description ?? ""}
              onChange={(e) =>
                patchZone(selectedZoneDef.zone, { description: e.target.value })
              }
              maxLength={250}
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                const idx = indexByZone(selectedZoneDef.zone);
                if (idx >= 0) removeByIndex(idx);
              }}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Quitar daño
            </button>
            <button
              type="button"
              onClick={() => setSelectedZone(null)}
              className="btn-primary"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* Resumen de daños marcados */}
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-rapid-text-muted">
          Daños marcados ({markedCount + legacyDamages.length})
        </p>
        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed border-rapid-border py-6 text-center text-sm text-rapid-text-muted">
            Sin daños. Toca una zona del vehículo para marcar el primero.
          </div>
        ) : (
          <ul className="space-y-2">
            {value.map((d, idx) => {
              const zoneDef =
                d.zoneNumber != null ? VEHICLE_ZONE_MAP[d.zoneNumber] : null;
              return (
                <li
                  key={idx}
                  className="flex items-center gap-2.5 rounded-lg border border-rapid-border bg-white p-2.5"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (zoneDef) {
                        setActiveSide(zoneDef.side);
                        setSelectedZone(zoneDef.zone);
                      }
                    }}
                    className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
                  >
                    <span
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        zoneDef
                          ? "bg-rapid-error text-white"
                          : "bg-rapid-surface-strong text-rapid-text-muted",
                      )}
                    >
                      {zoneDef ? zoneDef.zone : "—"}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-rapid-text">
                        {zoneDef
                          ? `${VIEW_DEFS[zoneDef.side].label} · ${zoneDef.name}`
                          : "Sin zona señalizada"}
                      </span>
                      <span className="block truncate text-xs text-rapid-text-muted">
                        {typeLabel(d.damageType)}
                        {d.description ? ` · ${d.description}` : ""}
                      </span>
                    </span>
                  </button>
                  {!zoneDef && (
                    <button
                      type="button"
                      onClick={() => {
                        setLocatingIdx(idx);
                        setSelectedZone(null);
                      }}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-rapid-border px-2.5 py-1.5 text-xs font-semibold text-rapid-text-body hover:border-rapid-green"
                    >
                      <MapPin className="h-3.5 w-3.5" /> Ubicar
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeByIndex(idx)}
                    aria-label="Eliminar daño"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
