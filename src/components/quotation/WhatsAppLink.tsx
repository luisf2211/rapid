"use client";

import { MessageCircle } from "lucide-react";

export function WhatsAppLink({
  phone,
  customerName,
  printPath,
}: {
  phone?: string | null;
  customerName: string;
  printPath: string;
}) {
  const handleClick = () => {
    const baseUrl = window.location.origin;
    const printUrl = `${baseUrl}${printPath}`;
    const message = encodeURIComponent(
      `Hola ${customerName}, le compartimos su cotización.\n\nPuede verla aquí: ${printUrl}\n\nGracias por confiar en nosotros.`,
    );
    const digits = phone ? phone.replace(/\D/g, "") : "";
    const waUrl = digits
      ? `https://wa.me/${digits.length === 10 ? "1" + digits : digits}?text=${message}`
      : `https://wa.me/?text=${message}`;
    window.open(waUrl, "_blank");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface transition-colors"
    >
      <MessageCircle className="w-4 h-4" />
      WhatsApp
    </button>
  );
}
