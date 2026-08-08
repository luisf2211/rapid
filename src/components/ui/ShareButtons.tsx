"use client";

import { MessageCircle, Mail, Download } from "lucide-react";

interface ShareButtonsProps {
  /** Tipo de documento (para el mensaje) */
  documentType: "orden de recepción" | "cotización" | "factura";
  /** Número del documento (ORD-00001, COT-00001, FAC-00001) */
  documentNumber: string;
  /** Nombre del cliente */
  customerName: string;
  /** Teléfono del cliente (sin formato, ej: "18095551234") */
  phone?: string | null;
  /** Email del cliente */
  email?: string | null;
  /** URL pública del print (relativa, ej: /print/work-orders/5) */
  printPath: string;
}

function cleanPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "1" + digits;
  return digits;
}

export function ShareButtons({
  documentType,
  documentNumber,
  customerName,
  phone,
  email,
  printPath,
}: ShareButtonsProps) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const printUrl = `${baseUrl}${printPath}`;

  const whatsappMessage = encodeURIComponent(
    `Hola ${customerName}, le compartimos su ${documentType} ${documentNumber}.\n\nPuede verla aquí: ${printUrl}\n\nGracias por confiar en nosotros.`,
  );

  const emailSubject = encodeURIComponent(
    `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} ${documentNumber}`,
  );
  const emailBody = encodeURIComponent(
    `Estimado/a ${customerName},\n\nAdjunto encontrará su ${documentType} ${documentNumber}.\n\nEnlace: ${printUrl}\n\nQuedamos a su disposición para cualquier consulta.\n\nSaludos cordiales.`,
  );

  const whatsappHref = phone
    ? `https://wa.me/${cleanPhone(phone)}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;

  const emailHref = email
    ? `mailto:${email}?subject=${emailSubject}&body=${emailBody}`
    : `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleDownloadPdf = () => {
    const separator = printPath.includes("?") ? "&" : "?";
    window.open(`${printPath}${separator}auto=1`, "_blank");
  };

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={handleDownloadPdf}
        className="btn-secondary h-8 px-2.5 text-xs gap-1.5"
        title="Descargar / Imprimir PDF"
      >
        <Download className="w-3.5 h-3.5" />
        PDF
      </button>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
        title={phone ? `WhatsApp a ${phone}` : "Enviar por WhatsApp"}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        WhatsApp
      </a>
      <a
        href={emailHref}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        title={email ? `Correo a ${email}` : "Enviar por correo"}
      >
        <Mail className="w-3.5 h-3.5" />
        Correo
      </a>
    </div>
  );
}
