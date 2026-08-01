"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  SILHOUETTE_COMPONENTS,
  VIEW_DIMENSIONS,
  VIEW_LABELS,
  type VehicleView,
} from "./VehicleSilhouettes";
import { AnnotationToolbar } from "./AnnotationToolbar";
import { AnnotationLayer } from "./AnnotationLayer";
import {
  type AnnotationTool,
  type VehicleAnnotation,
  generateAnnotationId,
} from "./types";

const VIEWS: VehicleView[] = ["front", "back", "left", "right", "top"];

interface VehicleInspectionDiagramProps {
  annotations: VehicleAnnotation[];
  onChange: (annotations: VehicleAnnotation[]) => void;
}

/**
 * Componente principal del diagrama de inspección vehicular.
 * Muestra las 5 vistas del vehículo con pestañas, una barra de herramientas
 * y permite colocar anotaciones libremente sobre cualquier punto del SVG.
 */
export function VehicleInspectionDiagram({
  annotations,
  onChange,
}: VehicleInspectionDiagramProps) {
  const [activeView, setActiveView] = useState<VehicleView>("left");
  const [activeTool, setActiveTool] = useState<AnnotationTool>("crossMark");
  const [pendingText, setPendingText] = useState<{ id: string; x: number; y: number } | null>(null);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  const viewAnnotations = annotations.filter((a) => a.view === activeView);
  const dims = VIEW_DIMENSIONS[activeView];
  const SilhouetteComponent = SILHOUETTE_COMPONENTS[activeView];

  const nextNumber = annotations.length + 1;

  const handleSvgClick = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (activeTool === "eraser") return;
      if (pendingText) return;

      const container = svgContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp
      const x = Math.max(0, Math.min(100, xPct));
      const y = Math.max(0, Math.min(100, yPct));

      if (activeTool === "text") {
        const id = generateAnnotationId();
        setPendingText({ id, x, y });
        return;
      }

      const annotation: VehicleAnnotation = {
        id: generateAnnotationId(),
        view: activeView,
        tool: activeTool,
        x,
        y,
        number: nextNumber,
      };

      // Para scratches y arrows, calcular un endpoint por defecto
      if (activeTool === "scratch" || activeTool === "arrow") {
        annotation.x2 = Math.min(100, x + 8);
        annotation.y2 = activeTool === "arrow" ? Math.max(0, y - 6) : y;
      }

      onChange([...annotations, annotation]);
    },
    [activeTool, activeView, annotations, nextNumber, onChange, pendingText],
  );

  const handleAnnotationClick = useCallback(
    (e: React.MouseEvent, annId: string) => {
      e.stopPropagation();
      if (activeTool !== "eraser") return;
      const updated = annotations.filter((a) => a.id !== annId);
      // Renumber
      const renumbered = updated.map((a, i) => ({ ...a, number: i + 1 }));
      onChange(renumbered);
    },
    [activeTool, annotations, onChange],
  );

  const handleTextSubmit = useCallback(
    (text: string) => {
      if (!pendingText) return;
      if (text.trim()) {
        const annotation: VehicleAnnotation = {
          id: pendingText.id,
          view: activeView,
          tool: "text",
          x: pendingText.x,
          y: pendingText.y,
          text: text.trim(),
          number: nextNumber,
        };
        onChange([...annotations, annotation]);
      }
      setPendingText(null);
    },
    [pendingText, activeView, nextNumber, annotations, onChange],
  );

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <AnnotationToolbar activeTool={activeTool} onToolChange={setActiveTool} />

      {/* View Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {VIEWS.map((view) => {
          const count = annotations.filter((a) => a.view === view).length;
          return (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                activeView === view
                  ? "bg-rapid-green text-white"
                  : "bg-rapid-surface-soft text-rapid-text-muted hover:text-rapid-text hover:bg-white",
              )}
            >
              {VIEW_LABELS[view]}
              {count > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-white/20 text-[10px] font-bold">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* SVG Canvas */}
      <div
        ref={svgContainerRef}
        onPointerDown={handleSvgClick}
        className={cn(
          "relative border border-rapid-border rounded-lg bg-white overflow-hidden select-none touch-none",
          activeTool === "eraser" ? "cursor-not-allowed" : "cursor-crosshair",
        )}
        style={{ aspectRatio: `${dims.w} / ${dims.h}` }}
      >
        {/* Vehicle silhouette (behind) */}
        <SilhouetteComponent
          className="absolute inset-0 w-full h-full text-gray-300 pointer-events-none"
        />

        {/* Annotation overlay (SVG on top) */}
        <svg
          viewBox={`0 0 ${dims.w} ${dims.h}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <AnnotationLayer
            annotations={viewAnnotations}
            viewBoxW={dims.w}
            viewBoxH={dims.h}
          />
        </svg>

        {/* Clickable overlay for eraser (to intercept clicks on annotations) */}
        {activeTool === "eraser" && (
          <svg
            viewBox={`0 0 ${dims.w} ${dims.h}`}
            className="absolute inset-0 w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            {viewAnnotations.map((ann) => {
              const cx = (ann.x / 100) * dims.w;
              const cy = (ann.y / 100) * dims.h;
              return (
                <circle
                  key={ann.id}
                  cx={cx}
                  cy={cy}
                  r={14}
                  fill="transparent"
                  className="cursor-pointer hover:fill-red-100/50"
                  onClick={(e) => handleAnnotationClick(e, ann.id)}
                  style={{ pointerEvents: "all" }}
                />
              );
            })}
          </svg>
        )}

        {/* Text input popup */}
        {pendingText && (
          <div
            className="absolute z-10"
            style={{
              left: `${pendingText.x}%`,
              top: `${pendingText.y}%`,
              transform: "translate(-50%, -120%)",
            }}
          >
            <TextInputPopup
              onSubmit={handleTextSubmit}
              onCancel={() => setPendingText(null)}
            />
          </div>
        )}
      </div>

      {/* Annotation count */}
      <p className="text-xs text-rapid-text-muted">
        {annotations.length === 0
          ? "Toca sobre el vehículo para marcar daños."
          : `${annotations.length} daño${annotations.length > 1 ? "s" : ""} señalado${annotations.length > 1 ? "s" : ""}.`}
      </p>
    </div>
  );
}

/** Popup inline para ingresar texto */
function TextInputPopup({
  onSubmit,
  onCancel,
}: {
  onSubmit: (text: string) => void;
  onCancel: () => void;
}) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(text);
      }}
      className="flex items-center gap-1 bg-white border border-rapid-border rounded-lg shadow-lg p-1.5"
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nota..."
        className="w-28 px-2 py-1 text-xs border border-rapid-border rounded"
        autoFocus
        maxLength={40}
      />
      <button
        type="submit"
        className="px-2 py-1 text-xs font-medium bg-rapid-green text-white rounded"
      >
        OK
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-2 py-1 text-xs text-rapid-text-muted hover:text-rapid-text"
      >
        ✕
      </button>
    </form>
  );
}
