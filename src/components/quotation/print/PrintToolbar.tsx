"use client";

import { useEffect } from "react";

export function PrintToolbar({
  backHref,
  autoPrint,
}: {
  backHref: string;
  autoPrint?: boolean;
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
        Volver a la cotización
      </a>
    </div>
  );
}
