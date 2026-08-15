"use client";

import { useState, useRef, useEffect } from "react";
import { Printer, Share2, ChevronDown } from "lucide-react";

/**
 * Botón con dropdown que abre la impresión al elegir una opción.
 */
export function PrintSelect({
  quotationId,
  isInsurance,
}: {
  quotationId: number;
  isInsurance: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const base = `/print/quotations/${quotationId}?auto=1`;

  const handlePick = (url: string) => {
    setOpen(false);
    window.open(url, "_blank");
  };

  if (!isInsurance) {
    return (
      <button
        type="button"
        onClick={() => window.open(base, "_blank")}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        Imprimir
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
      >
        <Printer className="w-3.5 h-3.5" />
        Imprimir
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute left-0 top-full mt-1 w-40 bg-white border border-rapid-border rounded-lg shadow-lg z-50 py-1 text-sm">
          <button type="button" onClick={() => handlePick(base)} className="w-full text-left px-3 py-1.5 hover:bg-rapid-surface transition-colors">Completa</button>
          <button type="button" onClick={() => handlePick(`${base}&view=insurance`)} className="w-full text-left px-3 py-1.5 hover:bg-rapid-surface transition-colors">Solo aseguradora</button>
          <button type="button" onClick={() => handlePick(`${base}&view=client`)} className="w-full text-left px-3 py-1.5 hover:bg-rapid-surface transition-colors">Solo cliente</button>
        </div>
      )}
    </div>
  );
}

/**
 * Botón con dropdown para compartir (WhatsApp, correo, copiar enlace).
 */
export function ShareSelect({
  phone,
  customerName,
  printPath,
}: {
  phone?: string | null;
  customerName: string;
  printPath: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const handlePick = (action: string) => {
    setOpen(false);
    const baseUrl = window.location.origin;
    const printUrl = `${baseUrl}${printPath}`;

    if (action === "whatsapp") {
      const digits = phone ? phone.replace(/\D/g, "") : "";
      const formattedPhone = digits.length === 10 ? "1" + digits : digits;
      const message = encodeURIComponent(
        `Hola ${customerName}, le compartimos su cotización.\n\nPuede verla aquí: ${printUrl}\n\nGracias por confiar en nosotros.`,
      );
      const waUrl = formattedPhone
        ? `https://wa.me/${formattedPhone}?text=${message}`
        : `https://wa.me/?text=${message}`;
      window.open(waUrl, "_blank");
    } else if (action === "email") {
      const subject = encodeURIComponent("Cotización");
      const body = encodeURIComponent(
        `Estimado/a ${customerName},\n\nLe compartimos su cotización.\n\nEnlace: ${printUrl}\n\nSaludos cordiales.`,
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else if (action === "copy") {
      navigator.clipboard.writeText(printUrl);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface rounded-lg transition-colors"
      >
        <Share2 className="w-3.5 h-3.5" />
        Compartir
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-rapid-border rounded-lg shadow-lg z-50 py-1 text-sm">
          <button type="button" onClick={() => handlePick("whatsapp")} className="w-full text-left px-3 py-1.5 hover:bg-rapid-surface transition-colors">WhatsApp</button>
          <button type="button" onClick={() => handlePick("email")} className="w-full text-left px-3 py-1.5 hover:bg-rapid-surface transition-colors">Correo electrónico</button>
          <button type="button" onClick={() => handlePick("copy")} className="w-full text-left px-3 py-1.5 hover:bg-rapid-surface transition-colors">Copiar enlace</button>
        </div>
      )}
    </div>
  );
}
