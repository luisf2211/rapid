"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Eraser, PenLine } from "lucide-react";
import { resolvePhotoUrl } from "@/lib/photos";
import { cn } from "@/lib/utils";

const CANVAS_HEIGHT_PX = 144;

interface SignaturePadProps {
  value?: string;
  onChange: (url: string) => void;
  error?: string;
  disabled?: boolean;
  label?: string;
}

/** Coordenadas en píxeles CSS (coinciden con el contexto escalado por DPR). */
function pointerToLocal(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

export function SignaturePad({
  value = "",
  onChange,
  error,
  disabled = false,
  label = "Firma del cliente",
}: SignaturePadProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasStroke = useRef(false);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const cssWidth = container.clientWidth;
    const cssHeight = CANVAS_HEIGHT_PX;
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.max(1, Math.round(cssWidth * dpr));
    canvas.height = Math.max(1, Math.round(cssHeight * dpr));
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cssWidth, cssHeight);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawing.current = false;
    lastPoint.current = null;
    hasStroke.current = false;
  }, []);

  useEffect(() => {
    if (value) return;

    setupCanvas();

    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      setupCanvas();
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, [value, setupCanvas]);

  const plot = (x: number, y: number) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const prev = lastPoint.current;
    if (prev) {
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fillStyle = "#111827";
      ctx.fill();
      ctx.strokeStyle = "#111827";
    }

    lastPoint.current = { x, y };
    hasStroke.current = true;
    setLocalError(null);
  };

  const startDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (disabled || uploading) return;
    event.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(event.pointerId);
    drawing.current = true;
    lastPoint.current = null;

    const { x, y } = pointerToLocal(canvas, event.clientX, event.clientY);
    plot(x, y);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || disabled) return;
    event.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const { x, y } = pointerToLocal(canvas, event.clientX, event.clientY);
    plot(x, y);
  };

  const endDraw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    drawing.current = false;
    lastPoint.current = null;
    if (canvasRef.current?.hasPointerCapture(event.pointerId)) {
      canvasRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const clear = () => {
    setupCanvas();
    setLocalError(null);
  };

  const confirm = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!hasStroke.current) {
      setLocalError("Dibuje la firma en el recuadro");
      return;
    }
    setUploading(true);
    setLocalError(null);
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch("/api/upload/signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });
      const data = (await res.json()) as { photoUrl?: string; error?: string };
      if (!res.ok || !data.photoUrl) {
        throw new Error(data.error ?? "No se pudo guardar la firma");
      }
      onChange(data.photoUrl);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Error al guardar la firma");
    } finally {
      setUploading(false);
    }
  };

  const displayError = error ?? localError;
  const savedSrc = value ? resolvePhotoUrl(value) || value : "";

  return (
    <div className="space-y-2">
      <p className="form-label">{label}</p>

      {value ? (
        <div className="rounded-lg border border-rapid-border bg-white p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={savedSrc}
            alt="Firma del cliente"
            className="mx-auto max-h-28 object-contain"
          />
          {!disabled && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="mt-3 text-xs font-semibold text-rapid-green-dark hover:underline"
            >
              Volver a firmar
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            ref={containerRef}
            className={cn(
              "rounded-lg border bg-white overflow-hidden touch-none select-none",
              displayError ? "border-red-300" : "border-rapid-border",
              disabled && "opacity-60 pointer-events-none",
            )}
            style={{ touchAction: "none" }}
          >
            <canvas
              ref={canvasRef}
              className="block w-full cursor-crosshair bg-white"
              style={{ height: CANVAS_HEIGHT_PX, touchAction: "none" }}
              onPointerDown={startDraw}
              onPointerMove={draw}
              onPointerUp={endDraw}
              onPointerLeave={endDraw}
              onPointerCancel={endDraw}
            />
          </div>
          <p className="text-xs text-rapid-text-muted">
            Firme con el dedo o el mouse, luego pulse «Confirmar firma».
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirm}
              disabled={disabled || uploading}
              className="btn-primary text-xs py-2"
            >
              <PenLine className="w-3.5 h-3.5" />
              {uploading ? "Guardando…" : "Confirmar firma"}
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={disabled || uploading}
              className="btn-secondary text-xs py-2"
            >
              <Eraser className="w-3.5 h-3.5" />
              Limpiar
            </button>
          </div>
        </>
      )}

      {displayError && (
        <p className="text-xs text-red-600">{displayError}</p>
      )}
    </div>
  );
}
