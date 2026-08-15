"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  MoreHorizontal,
  Printer,
  MessageCircle,
  Mail,
  Trash2,
  Download,
} from "lucide-react";
import { deleteQuotationAction } from "@/app/(app)/quotations/actions";

interface QuotationActionsMenuProps {
  quotationId: number;
  quotationNumber: number;
  quotationType: string;
  customerName: string;
  phone?: string | null;
  email?: string | null;
  canDelete: boolean;
}

function cleanPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) digits = "1" + digits;
  return digits;
}

export function QuotationActionsMenu({
  quotationId,
  quotationNumber,
  quotationType,
  customerName,
  phone,
  email,
  canDelete,
}: QuotationActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const printBase = `/print/quotations/${quotationId}`;
  const isInsurance = quotationType === "INSURANCE";

  const docNumber = isInsurance
    ? `PRE-${String(quotationNumber).padStart(5, "0")}`
    : `COT-${String(quotationNumber).padStart(5, "0")}`;

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const printUrl = `${baseUrl}${printBase}`;

  const whatsappMessage = encodeURIComponent(
    `Hola ${customerName}, le compartimos su cotización ${docNumber}.\n\nPuede verla aquí: ${printUrl}\n\nGracias por confiar en nosotros.`,
  );
  const whatsappHref = phone
    ? `https://wa.me/${cleanPhone(phone)}?text=${whatsappMessage}`
    : `https://wa.me/?text=${whatsappMessage}`;

  const emailSubject = encodeURIComponent(`Cotización ${docNumber}`);
  const emailBody = encodeURIComponent(
    `Estimado/a ${customerName},\n\nAdjunto encontrará su cotización ${docNumber}.\n\nEnlace: ${printUrl}\n\nSaludos cordiales.`,
  );
  const emailHref = email
    ? `mailto:${email}?subject=${emailSubject}&body=${emailBody}`
    : `mailto:?subject=${emailSubject}&body=${emailBody}`;

  const handleDelete = () => {
    setOpen(false);
    const msg = `¿Eliminar cotización #${quotationNumber}?`;
    if (!window.confirm(msg)) return;
    startTransition(async () => {
      const res = await deleteQuotationAction(quotationId);
      if (!res.ok) return;
      router.push("/quotations");
      router.refresh();
    });
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg text-rapid-text-muted hover:text-rapid-text hover:bg-rapid-surface transition-colors"
        aria-label="Más acciones"
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-rapid-border rounded-xl shadow-lg z-50 py-1 text-sm">
          {/* Imprimir */}
          <div className="px-3 py-1.5 text-[11px] font-medium text-rapid-text-muted uppercase tracking-wide">
            Imprimir
          </div>
          {isInsurance ? (
            <>
              <MenuItem
                href={`${printBase}?auto=1`}
                icon={<Printer className="w-4 h-4" />}
                label="Completa"
                external
              />
              <MenuItem
                href={`${printBase}?auto=1&view=insurance`}
                icon={<Printer className="w-4 h-4" />}
                label="Solo aseguradora"
                external
              />
              <MenuItem
                href={`${printBase}?auto=1&view=client`}
                icon={<Printer className="w-4 h-4" />}
                label="Solo cliente"
                external
              />
            </>
          ) : (
            <MenuItem
              href={`${printBase}?auto=1`}
              icon={<Printer className="w-4 h-4" />}
              label="Imprimir"
              external
            />
          )}

          <div className="my-1 border-t border-rapid-border" />

          {/* Compartir */}
          <div className="px-3 py-1.5 text-[11px] font-medium text-rapid-text-muted uppercase tracking-wide">
            Compartir
          </div>
          <MenuItem
            href={whatsappHref}
            icon={<MessageCircle className="w-4 h-4" />}
            label="WhatsApp"
            external
          />
          <MenuItem
            href={emailHref}
            icon={<Mail className="w-4 h-4" />}
            label="Correo electrónico"
            external
          />
          <MenuItem
            href={`${printBase}?auto=1`}
            icon={<Download className="w-4 h-4" />}
            label="Descargar PDF"
            external
          />

          {canDelete && (
            <>
              <div className="my-1 border-t border-rapid-border" />
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {pending ? "Eliminando..." : "Eliminar"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  external,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2.5 px-3 py-2 text-rapid-text hover:bg-rapid-surface transition-colors"
    >
      <span className="text-rapid-text-muted">{icon}</span>
      {label}
    </a>
  );
}
