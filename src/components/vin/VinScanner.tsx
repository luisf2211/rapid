"use client";

import { useCallback, useRef, useState } from "react";
import { Camera, Loader2, Check, RotateCcw, Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractVinCandidates } from "@/lib/vin/normalize";
import { validateVin } from "@/lib/vin/validate";
import type { VinDecodeResult } from "@/lib/vin/nhtsa";

type ScannerState =
  | "idle"
  | "capturing"
  | "processing"
  | "detected"
  | "editing"
  | "fetching"
  | "done"
  | "error";

interface VinScannerProps {
  /** Called when VIN is confirmed and vehicle data decoded */
  onResult: (data: VinDecodeResult) => void;
  /** Called when user confirms VIN without NHTSA (manual fallback) */
  onVinConfirmed?: (vin: string) => void;
  /** Called to close the scanner */
  onClose: () => void;
}

/**
 * VIN Scanner component — captures image via camera, runs OCR client-side
 * with Tesseract.js (lazy loaded), validates VIN, then fetches vehicle data
 * from NHTSA via /api/vin/[vin].
 */
export function VinScanner({ onResult, onVinConfirmed, onClose }: VinScannerProps) {
  const [state, setState] = useState<ScannerState>("idle");
  const [detectedVin, setDetectedVin] = useState("");
  const [editVin, setEditVin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  /** Trigger camera/file picker */
  const handleCapture = () => {
    setState("capturing");
    fileInputRef.current?.click();
  };

  /** Process captured image with Tesseract OCR */
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) { setState("idle"); return; }

    setState("processing");
    setError(null);

    try {
      // Preprocess image on canvas
      const imageUrl = URL.createObjectURL(file);
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
        img.src = imageUrl;
      });

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      // Limit resolution for OCR performance (max 1200px wide)
      const maxW = 1200;
      const scale = Math.min(1, maxW / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Enhance contrast for better OCR
      ctx.filter = "contrast(1.5) grayscale(1)";
      ctx.drawImage(canvas, 0, 0);
      ctx.filter = "none";

      URL.revokeObjectURL(imageUrl);

      // Lazy load Tesseract.js
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng");

      // Run OCR
      const { data: { text } } = await worker.recognize(canvas);
      await worker.terminate();

      // Extract VIN candidates
      const candidates = extractVinCandidates(text);

      if (candidates.length === 0) {
        setState("error");
        setError("No se detecto un VIN. Intenta acercarte al VIN y evitar reflejos.");
        return;
      }

      // Use the first candidate
      const vin = candidates[0];
      setDetectedVin(vin);
      setEditVin(vin);

      // Validate
      const validation = validateVin(vin);
      if (!validation.formatValid) {
        setValidationWarning("El formato del VIN detectado no es valido. Verifica los caracteres.");
      } else if (!validation.checkDigitValid) {
        setValidationWarning("El digito verificador no coincide. Puede ser valido en algunos mercados.");
      } else {
        setValidationWarning(null);
      }

      setState("detected");
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Error al procesar la imagen");
    }

    // Reset file input for repeated scans
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  /** Confirm VIN and fetch from NHTSA */
  const handleConfirm = async () => {
    const vin = editVin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    const validation = validateVin(vin);

    if (!validation.formatValid) {
      setError("El VIN debe tener 17 caracteres validos (sin I, O, Q).");
      return;
    }

    setState("fetching");
    setError(null);

    try {
      const res = await fetch(`/api/vin/${vin}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Error de red" }));
        // Let user continue manually if NHTSA fails
        setError(data.error || "No se pudo consultar la informacion del vehiculo.");
        setState("detected");
        return;
      }

      const result: VinDecodeResult = await res.json();

      if (!result.decoded) {
        setError("NHTSA no tiene informacion suficiente para este VIN. Puedes continuar manualmente.");
        onVinConfirmed?.(vin);
        setState("detected");
        return;
      }

      onResult(result);
      setState("done");
    } catch {
      setError("Error de conexion al consultar el vehiculo. Puedes continuar manualmente.");
      setState("detected");
    }
  };

  /** Use VIN without NHTSA lookup */
  const handleUseManually = () => {
    const vin = editVin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, "");
    onVinConfirmed?.(vin);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-rapid-border">
          <h3 className="font-bold text-lg">Escanear VIN</h3>
          <button type="button" onClick={onClose} className="p-1 text-rapid-text-muted hover:text-rapid-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Hidden file input for camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Hidden canvas for preprocessing */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Idle / Capture state */}
          {(state === "idle" || state === "capturing") && (
            <div className="text-center space-y-4">
              <div className="mx-auto w-64 h-32 border-2 border-dashed border-rapid-border rounded-lg flex items-center justify-center bg-rapid-surface-soft">
                <p className="text-sm text-rapid-text-muted px-4">
                  Coloca el VIN dentro del recuadro de la camara
                </p>
              </div>
              <button
                type="button"
                onClick={handleCapture}
                className="btn-primary px-6 py-3"
              >
                <Camera className="w-5 h-5" />
                Capturar VIN
              </button>
              <p className="text-xs text-rapid-text-muted">
                Tambien puedes ingresar el VIN manualmente abajo.
              </p>
            </div>
          )}

          {/* Processing */}
          {state === "processing" && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-rapid-green" />
              <p className="text-sm font-medium">Leyendo VIN...</p>
              <p className="text-xs text-rapid-text-muted">Procesando imagen con OCR</p>
            </div>
          )}

          {/* VIN Detected */}
          {(state === "detected" || state === "editing") && (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wide text-rapid-text-muted mb-2">
                  VIN detectado
                </p>
                <input
                  type="text"
                  value={editVin}
                  onChange={(e) => setEditVin(e.target.value.toUpperCase())}
                  className="form-input text-center font-mono text-lg tracking-wider w-full"
                  maxLength={17}
                />
              </div>

              {validationWarning && (
                <p className="text-xs text-amber-600 text-center">{validationWarning}</p>
              )}

              {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
              )}

              <p className="text-xs text-rapid-text-muted text-center">
                Verifica que el VIN coincida con el vehiculo.
              </p>

              <div className="flex gap-2">
                <button type="button" onClick={handleConfirm} className="btn-primary flex-1">
                  <Check className="w-4 h-4" /> Confirmar
                </button>
                <button type="button" onClick={handleCapture} className="btn-secondary">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleUseManually}
                className="w-full text-center text-xs text-rapid-text-muted hover:text-rapid-text py-1"
              >
                Usar VIN sin buscar datos
              </button>
            </div>
          )}

          {/* Fetching from NHTSA */}
          {state === "fetching" && (
            <div className="text-center py-8 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-rapid-green" />
              <p className="text-sm font-medium">Buscando informacion del vehiculo...</p>
              <p className="text-xs text-rapid-text-muted font-mono">{editVin}</p>
            </div>
          )}

          {/* Done */}
          {state === "done" && (
            <div className="text-center py-6 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-medium">Vehiculo identificado</p>
              <p className="text-xs text-rapid-text-muted">Los datos se completaron automaticamente.</p>
            </div>
          )}

          {/* Error state */}
          {state === "error" && (
            <div className="space-y-4 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <div className="flex gap-2 justify-center">
                <button type="button" onClick={handleCapture} className="btn-primary">
                  <Camera className="w-4 h-4" /> Intentar de nuevo
                </button>
                <button type="button" onClick={onClose} className="btn-secondary">
                  Continuar manual
                </button>
              </div>
            </div>
          )}

          {/* Manual VIN entry (always available at bottom) */}
          {(state === "idle" || state === "error") && (
            <div className="border-t border-rapid-border pt-4">
              <p className="text-xs font-semibold text-rapid-text-muted mb-2">Ingresar VIN manualmente</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editVin}
                  onChange={(e) => setEditVin(e.target.value.toUpperCase())}
                  placeholder="5YFBURHE1JP817423"
                  className="form-input flex-1 font-mono text-sm"
                  maxLength={17}
                />
                <button
                  type="button"
                  onClick={() => { if (editVin.length === 17) { setDetectedVin(editVin); setState("detected"); } }}
                  disabled={editVin.length !== 17}
                  className="btn-primary px-3"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
