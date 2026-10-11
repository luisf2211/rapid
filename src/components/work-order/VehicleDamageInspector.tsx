"use client";

import { useRef, useState } from "react";
import { Camera, Check, Loader2, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SILHOUETTE_COMPONENTS,
  VIEW_DIMENSIONS,
  type VehicleView,
} from "@/components/vehicle-inspection/VehicleSilhouettes";
import {
  DAMAGE_TYPES,
  DAMAGE_TYPE_BY_ID,
  SEVERITIES,
  VEHICLE_VIEWS,
  VEHICLE_PARTS_BY_VIEW,
  detectPart,
  type DamageTypeId,
  type SeverityId,
} from "@/lib/vehicle-damage/catalog";
import type { DamageInput } from "@/lib/validations/work-order";

interface Props {
  value: DamageInput[];
  onChange: (next: DamageInput[]) => void;
}

type DraftState =
  | { mode: "closed" }
  | { mode: "new"; index: number }
  | { mode: "edit"; index: number };

export function VehicleDamageInspector({ value, onChange }: Props) {
  const [activeType, setActiveType] = useState<DamageTypeId>("GOLPE");
  const [activeView, setActiveView] = useState<VehicleView>("left");
  const [draft, setDraft] = useState<DraftState>({ mode: "closed" });
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const svgWrapRef = useRef<HTMLDivElement>(null);

  const dims = VIEW_DIMENSIONS[activeView];
  const Silhouette = SILHOUETTE_COMPONENTS[activeView];
  const viewDamages = value
    .map((d, index) => ({ d, index }))
    .filter((x) => x.d.view === activeView);

  function handleTap(e: React.PointerEvent<HTMLDivElement>) {
    if (draft.mode !== "closed") return;
    const wrap = svgWrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const part = detectPart(activeView, x, y);
    const newDamage: DamageInput = {
      view: activeView,
      x: Math.round(x * 10) / 10,
      y: Math.round(y * 10) / 10,
      damageTypeId: activeType,
      severity: "LEVE",
      vehiclePartId: part?.id ?? "",
      partName: part?.label ?? "",
      observations: "",
      photos: [],
    };
    const next = [...value, newDamage];
    onChange(next);
    setDraft({ mode: "new", index: next.length - 1 });
    setSelectedIndex(next.length - 1);
  }

  function updateDamage(index: number, patch: Partial<DamageInput>) {
    onChange(value.map((d, i) => (i === index ? { ...d, ...patch } : d)));
  }

  function removeDamage(index: number) {
    onChange(value.filter((_, i) => i !== index));
    setDraft({ mode: "closed" });
    setSelectedIndex(null);
  }

  function closeDraft() {
    setDraft({ mode: "closed" });
  }

  const draftIndex = draft.mode !== "closed" ? draft.index : null;
  const draftDamage = draftIndex != null ? value[draftIndex] : null;

  return (
    <div className="space-y-4">
      {/* 1. Selector de tipo de daño */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
          Tipo de daño
        </p>
        <div className="flex flex-wrap gap-2">
          {DAMAGE_TYPES.map((t) => {
            const active = activeType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveType(t.id)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-all min-h-11",
                  active
                    ? "border-transparent text-white shadow-sm"
                    : "border-rapid-border bg-white text-rapid-text-body hover:border-rapid-text/25",
                )}
                style={active ? { backgroundColor: t.color } : undefined}
              >
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    active ? "bg-white/25 text-white" : "text-white",
                  )}
                  style={!active ? { backgroundColor: t.color } : undefined}
                >
                  {t.letter}
                </span>
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selector de vista */}
      <div>
        <div className="flex flex-wrap gap-2">
          {VEHICLE_VIEWS.map((v) => {
            const active = activeView === v.id;
            const count = value.filter((d) => d.view === v.id).length;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => setActiveView(v.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors min-h-11",
                  active
                    ? "bg-rapid-black text-white"
                    : "bg-rapid-surface-soft text-rapid-text-muted hover:text-rapid-text",
                )}
              >
                {v.label}
                {count > 0 && (
                  <span
                    className={cn(
                      "inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[11px] font-bold",
                      active ? "bg-white/20" : "bg-rapid-green text-white",
                    )}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3 + 6. Diagrama + lista */}
      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        {/* Diagrama */}
        <div>
          <div
            ref={svgWrapRef}
            onPointerDown={handleTap}
            className={cn(
              "relative select-none touch-none overflow-hidden rounded-xl border border-rapid-border bg-white",
              draft.mode === "closed" ? "cursor-crosshair" : "cursor-default",
            )}
            style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
          >
            <Silhouette className="absolute inset-0 h-full w-full text-gray-300" />
            {viewDamages.map(({ d, index }) => {
              const def = DAMAGE_TYPE_BY_ID[d.damageTypeId];
              const num = index + 1;
              const isSel = selectedIndex === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(index);
                    setDraft({ mode: "edit", index });
                  }}
                  className={cn(
                    "absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[11px] font-bold text-white shadow-md transition-transform",
                    isSel && "scale-125 ring-2 ring-rapid-black",
                  )}
                  style={{
                    left: `${d.x}%`,
                    top: `${d.y}%`,
                    backgroundColor: def?.color ?? "#dc2626",
                  }}
                  title={`${num}. ${def?.label ?? ""}`}
                >
                  {num}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-center text-xs text-rapid-text-muted-soft">
            Selecciona un tipo y toca el vehículo para marcar un daño
          </p>
        </div>

        {/* Lista de daños */}
        <div className="rounded-xl border border-rapid-border bg-rapid-surface-soft p-3">
          <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-rapid-text-muted">
            Daños detectados ({value.length})
          </p>
          {value.length === 0 ? (
            <p className="px-1 py-6 text-center text-sm text-rapid-text-muted-soft">
              Aún no hay daños marcados.
            </p>
          ) : (
            <ul className="space-y-1.5">
              {value.map((d, index) => {
                const def = DAMAGE_TYPE_BY_ID[d.damageTypeId];
                const isSel = selectedIndex === index;
                return (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedIndex(index);
                        setActiveView(d.view);
                        setDraft({ mode: "edit", index });
                      }}
                      className={cn(
                        "flex w-full items-start gap-2.5 rounded-lg border p-2.5 text-left transition-colors",
                        isSel
                          ? "border-rapid-black bg-white"
                          : "border-transparent bg-white hover:border-rapid-border",
                      )}
                    >
                      <span
                        className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                        style={{ backgroundColor: def?.color ?? "#dc2626" }}
                      >
                        {index + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-rapid-text">
                          {def?.label ?? d.damageTypeId}
                        </span>
                        <span className="block truncate text-xs text-rapid-text-muted">
                          {d.partName || "Pieza sin definir"}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-xs text-rapid-text-muted-soft">
                          {SEVERITIES.find((s) => s.id === d.severity)?.label}
                          {d.photos.length > 0 && (
                            <span className="inline-flex items-center gap-0.5">
                              <Camera className="h-3 w-3" />
                              {d.photos.length}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* 5. Editor del daño (panel) */}
      {draftDamage && draftIndex != null && (
        <DamageEditorPanel
          damage={draftDamage}
          view={draftDamage.view}
          isNew={draft.mode === "new"}
          onPatch={(patch) => updateDamage(draftIndex, patch)}
          onRemove={() => removeDamage(draftIndex)}
          onClose={closeDraft}
        />
      )}
    </div>
  );
}

function DamageEditorPanel({
  damage,
  view,
  isNew,
  onPatch,
  onRemove,
  onClose,
}: {
  damage: DamageInput;
  view: VehicleView;
  isNew: boolean;
  onPatch: (patch: Partial<DamageInput>) => void;
  onRemove: () => void;
  onClose: () => void;
}) {
  const def = DAMAGE_TYPE_BY_ID[damage.damageTypeId];
  const parts = VEHICLE_PARTS_BY_VIEW[view] ?? [];
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList) {
    setUploading(true);
    try {
      const { compressImage } = await import("@/lib/images/compress-client");
      for (const original of Array.from(files).slice(0, 8 - damage.photos.length)) {
        const file = await compressImage(original);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("subfolder", "field");
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const json = await res.json();
        if (res.ok && json.photoUrl) {
          onPatch({ photos: [...damage.photos, json.photoUrl] });
        }
      }
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-xl border border-rapid-border bg-white p-4 shadow-sm sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: def?.color ?? "#dc2626" }}
          >
            {def?.letter ?? "•"}
          </span>
          <span className="font-semibold text-rapid-text">{def?.label}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-rapid-text-muted hover:bg-rapid-surface-strong"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Pieza */}
        <div>
          <label className="form-label">Pieza / área</label>
          <select
            className="form-input"
            value={damage.vehiclePartId || ""}
            onChange={(e) => {
              const p = parts.find((x) => x.id === e.target.value);
              onPatch({ vehiclePartId: e.target.value, partName: p?.label ?? "" });
            }}
          >
            <option value="">Sin definir</option>
            {parts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Severidad */}
        <div>
          <label className="form-label">Severidad</label>
          <div className="flex gap-2">
            {SEVERITIES.map((s) => {
              const active = damage.severity === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onPatch({ severity: s.id as SeverityId })}
                  className={cn(
                    "flex-1 rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors min-h-11",
                    active
                      ? "border-rapid-green bg-rapid-green-soft text-rapid-green-dark"
                      : "border-rapid-border text-rapid-text-muted hover:border-rapid-text/25",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Observación */}
      <div className="mt-4">
        <label className="form-label">Observación (opcional)</label>
        <input
          type="text"
          className="form-input"
          placeholder="Ej: hundimiento de 10 cm"
          maxLength={250}
          value={damage.observations ?? ""}
          onChange={(e) => onPatch({ observations: e.target.value })}
        />
      </div>

      {/* Fotos */}
      <div className="mt-4">
        <label className="form-label">Fotos del daño</label>
        <div className="flex flex-wrap gap-2">
          {damage.photos.map((url) => (
            <div
              key={url}
              className="relative h-16 w-16 overflow-hidden rounded-lg border border-rapid-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Daño" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => onPatch({ photos: damage.photos.filter((p) => p !== url) })}
                className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white"
                aria-label="Quitar foto"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {damage.photos.length < 8 && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex h-16 w-16 flex-col items-center justify-center gap-0.5 rounded-lg border-2 border-dashed border-rapid-border text-rapid-text-muted hover:border-rapid-green hover:text-rapid-green"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
              <span className="text-[10px]">Foto</span>
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Acciones */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          Eliminar
        </button>
        <button type="button" onClick={onClose} className="btn-primary">
          <Check className="h-4 w-4" />
          {isNew ? "Guardar daño" : "Listo"}
        </button>
      </div>
    </div>
  );
}
