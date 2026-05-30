"use client";

import { useEffect } from "react";

export function PrintToolbar({
  backHref,
  autoPrint,
  backLabel = "Volver",
}: {
  backHref: string;
  autoPrint?: boolean;
  backLabel?: string;
}) {
  useEffect(() => {
    if (autoPrint) {
      const t = setTimeout(() => window.print(), 400);
      return () => clearTimeout(t);
    }
  }, [autoPrint]);

  return (
    <div className="qdoc-toolbar no-print">
      <button type="button" onClick={() => window.print()}>
        Imprimir / Guardar PDF
      </button>
      <a href={backHref} className="secondary">
        {backLabel}
      </a>
    </div>
  );
}
