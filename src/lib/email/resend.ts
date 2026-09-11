import { Resend } from "resend";

let client: Resend | null = null;

/** Cliente Resend (o null si no está configurado). */
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!client) client = new Resend(key);
  return client;
}

/** Remitente de los correos. Configurable por env. */
export function getEmailFrom(): string {
  return process.env.EMAIL_FROM ?? "Rapid <onboarding@resend.dev>";
}

/** URL base pública de la app para armar enlaces en los correos. */
export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:8000"
  ).replace(/\/$/, "");
}

export type SendEmailArgs = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
};

/**
 * Envía un correo best-effort: nunca lanza. Devuelve true si se envió.
 * Si Resend no está configurado, no hace nada y devuelve false.
 */
export async function sendEmail(args: SendEmailArgs): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    return false;
  }
  try {
    const { error } = await resend.emails.send({
      from: getEmailFrom(),
      to: args.to,
      subject: args.subject,
      html: args.html,
      replyTo: args.replyTo,
    });
    if (error) {
      console.error("[resend] send error:", error);
      return false;
    }
    return true;
  } catch (e) {
    console.error("[resend] send threw:", e);
    return false;
  }
}
