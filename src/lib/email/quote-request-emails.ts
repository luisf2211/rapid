import { sendEmail, getAppBaseUrl } from "./resend";

const BRAND_GREEN = "#00c853";
const INK = "#0a0d0c";

function layout(title: string, bodyHtml: string, footer?: string): string {
  return `
  <div style="background:#f8f9fa;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:520px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;overflow:hidden;">
      <div style="background:${INK};padding:20px 28px;">
        <span style="color:#ffffff;font-size:18px;font-weight:700;letter-spacing:-0.02em;">
          <span style="color:${BRAND_GREEN};">Rapid</span>
        </span>
      </div>
      <div style="padding:28px;">
        <h1 style="margin:0 0 16px;font-size:20px;color:${INK};font-weight:700;">${title}</h1>
        ${bodyHtml}
      </div>
      <div style="padding:16px 28px;border-top:1px solid #eef0f2;color:#9ca3af;font-size:12px;">
        ${footer ?? "Este correo fue enviado por Rapid."}
      </div>
    </div>
  </div>`;
}

function button(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:${BRAND_GREEN};color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:12px 22px;border-radius:10px;">${label}</a>`;
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;color:#6b7280;font-size:14px;width:120px;">${label}</td>
    <td style="padding:6px 0;color:${INK};font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

export type QuoteRequestEmailData = {
  workshopName: string;
  workshopEmails: string[];
  requestId: number;
  publicToken: string;
  customerName: string;
  customerEmail: string | null;
  phone: string;
  vehicle: string;
  plate: string | null;
  message: string;
  photoCount: number;
};

/** Notifica al taller que llegó una nueva solicitud (best-effort). */
export async function sendWorkshopNewRequestEmail(
  data: QuoteRequestEmailData,
): Promise<boolean> {
  if (data.workshopEmails.length === 0) return false;

  const base = getAppBaseUrl();
  const link = `${base}/solicitudes/${data.requestId}`;

  const details = `
    <table style="width:100%;border-collapse:collapse;margin:8px 0 20px;">
      ${row("Cliente", escapeHtml(data.customerName))}
      ${row("Teléfono", escapeHtml(data.phone))}
      ${data.customerEmail ? row("Correo", escapeHtml(data.customerEmail)) : ""}
      ${data.vehicle ? row("Vehículo", escapeHtml(data.vehicle)) : ""}
      ${data.plate ? row("Placa", escapeHtml(data.plate)) : ""}
      ${data.photoCount > 0 ? row("Fotos", String(data.photoCount)) : ""}
    </table>
    <div style="background:#f8f9fa;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin-bottom:20px;">
      <p style="margin:0;color:#374151;font-size:14px;line-height:1.5;">${escapeHtml(data.message)}</p>
    </div>
    <p style="margin:0 0 20px;">${button(link, "Ver solicitud")}</p>
    <p style="margin:0;color:#6b7280;font-size:13px;">Revísala y acéptala para convertirla en cotización, o recházala con un motivo.</p>
  `;

  return sendEmail({
    to: data.workshopEmails,
    replyTo: data.customerEmail ?? undefined,
    subject: `Nueva solicitud de cotización — ${data.customerName}`,
    html: layout(
      `Te llegó una solicitud en ${escapeHtml(data.workshopName)}`,
      details,
      "Recibiste este correo porque administras un taller en Rapid.",
    ),
  });
}

/** Confirma al cliente que su solicitud fue enviada, con el enlace de seguimiento. */
export async function sendCustomerRequestReceivedEmail(
  data: QuoteRequestEmailData,
): Promise<boolean> {
  if (!data.customerEmail) return false;

  const base = getAppBaseUrl();
  const link = `${base}/rastrear/${data.publicToken}`;

  const body = `
    <p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
      Hola ${escapeHtml(data.customerName)}, recibimos tu solicitud y se la enviamos a
      <strong>${escapeHtml(data.workshopName)}</strong>. El taller la revisará y te
      preparará una propuesta.
    </p>
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.6;">
      Puedes seguir el estado de tu solicitud en cualquier momento con este enlace:
    </p>
    <p style="margin:0 0 20px;">${button(link, "Seguir mi solicitud")}</p>
    <p style="margin:0;color:#6b7280;font-size:13px;word-break:break-all;">${link}</p>
  `;

  return sendEmail({
    to: data.customerEmail,
    subject: `Recibimos tu solicitud — ${data.workshopName}`,
    html: layout("Tu solicitud fue enviada", body),
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
