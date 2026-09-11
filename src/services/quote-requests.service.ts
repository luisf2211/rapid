import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import {
  sendCustomerAcceptedEmail,
  sendCustomerQuoteReadyEmail,
  sendCustomerRejectedEmail,
} from "@/lib/email/quote-request-emails";

/** Datos comunes del taller + cliente para los correos de avance. */
async function loadNotifyContext(quotationId: number) {
  const q = await prisma.quotation.findUnique({
    where: { id: quotationId },
    select: {
      publicToken: true,
      customerName: true,
      email: true,
      brand: true,
      model: true,
      vehicleYear: true,
      quotationNumber: true,
      grandTotal: true,
      estimatedDays: true,
      rejectionReason: true,
      requestSource: true,
      CompanyId: true,
      company: {
        select: {
          name: true,
          workshopSettings: { select: { businessName: true }, take: 1 },
        },
      },
    },
  });
  if (!q || !q.publicToken || !q.email) return null;
  const workshopName =
    q.company.workshopSettings[0]?.businessName?.trim() || q.company.name;
  const vehicle = [q.brand, q.model, q.vehicleYear?.toString()]
    .filter(Boolean)
    .join(" ");
  return { q, workshopName, vehicle };
}

const REQUEST_STATUS = "REQUESTED";
const REQUEST_SOURCE = "CUSTOMER_PORTAL";

function requestWhere(companyId: number) {
  return {
    ...companyWhere(companyId),
    status: REQUEST_STATUS,
    requestSource: REQUEST_SOURCE,
  };
}

/** Cuenta las solicitudes de clientes sin revisar (para el badge del menú). */
export async function countPendingRequests(): Promise<number> {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotation.count({ where: requestWhere(companyId) });
}

/** Lista las solicitudes de clientes en bandeja (estado REQUESTED). */
export async function listRequests(params?: { search?: string }) {
  const companyId = await requireCompanyIdFromSession();
  const where: {
    CompanyId: number;
    status: string;
    requestSource: string;
    OR?: unknown[];
  } = requestWhere(companyId);

  if (params?.search) {
    const s = params.search.trim();
    where.OR = [
      { customerName: { contains: s, mode: "insensitive" } },
      { plate: { contains: s, mode: "insensitive" } },
      { brand: { contains: s, mode: "insensitive" } },
      { model: { contains: s, mode: "insensitive" } },
      { phone: { contains: s, mode: "insensitive" } },
    ];
  }

  return prisma.quotation.findMany({
    where: where as never,
    orderBy: { createdAt: "desc" },
    include: { photos: { select: { id: true }, take: 1 } },
  });
}

export async function getRequestById(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.quotation.findFirst({
    where: { id, ...companyWhere(companyId) },
    include: {
      photos: { orderBy: { id: "asc" } },
      company: { select: { name: true, publicPhone: true } },
    },
  });
}

/**
 * El taller acepta la solicitud: se convierte en cotización DRAFT editable,
 * se le asigna el número real de cotización y se registra que fue vista.
 * Devuelve el id para redirigir al editor de cotización.
 */
export async function acceptRequest(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const q = await prisma.quotation.findFirst({
    where: { id, ...companyWhere(companyId) },
  });
  if (!q) throw new Error("Solicitud no encontrada");
  if (q.status !== REQUEST_STATUS) {
    throw new Error("Esta solicitud ya fue procesada");
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const quotationNumber = q.quotationNumber > 0
      ? q.quotationNumber
      : await (async () => {
          const max = await tx.quotation.aggregate({
            where: { CompanyId: companyId, quotationNumber: { gt: 0 } },
            _max: { quotationNumber: true },
          });
          return (max._max.quotationNumber ?? 0) + 1;
        })();

    return tx.quotation.update({
      where: { id },
      data: {
        status: "DRAFT",
        quotationNumber,
        viewedByShopAt: q.viewedByShopAt ?? now,
        respondedAt: now,
        updatedAt: now,
      },
      select: { id: true },
    });
  });

  // Aviso al cliente: su solicitud fue aceptada y está en proceso (best-effort).
  await notifyCustomerAccepted(id).catch((e) =>
    console.error("[quote-request] notify accepted failed:", e),
  );

  return result;
}

async function notifyCustomerAccepted(quotationId: number) {
  const ctx = await loadNotifyContext(quotationId);
  if (!ctx || ctx.q.requestSource !== REQUEST_SOURCE) return;
  await sendCustomerAcceptedEmail({
    workshopName: ctx.workshopName,
    customerName: ctx.q.customerName,
    customerEmail: ctx.q.email,
    publicToken: ctx.q.publicToken!,
    vehicle: ctx.vehicle,
  });
}

/** El taller rechaza la solicitud con un motivo (visible para el cliente). */
export async function rejectRequest(id: number, reason: string, actor?: string) {
  const companyId = await requireCompanyIdFromSession();
  const q = await prisma.quotation.findFirst({
    where: { id, ...companyWhere(companyId) },
  });
  if (!q) throw new Error("Solicitud no encontrada");
  if (q.status !== REQUEST_STATUS) {
    throw new Error("Esta solicitud ya fue procesada");
  }

  const now = new Date();

  const result = await prisma.quotation.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectedAt: now,
      rejectedBy: actor?.trim() || "Taller",
      rejectionReason: reason.trim(),
      viewedByShopAt: q.viewedByShopAt ?? now,
      respondedAt: now,
      updatedAt: now,
    },
    select: { id: true },
  });

  // Aviso al cliente: solicitud rechazada con motivo (best-effort).
  await notifyCustomerRejected(id, reason.trim()).catch((e) =>
    console.error("[quote-request] notify rejected failed:", e),
  );

  return result;
}

async function notifyCustomerRejected(quotationId: number, reason: string) {
  const ctx = await loadNotifyContext(quotationId);
  if (!ctx || ctx.q.requestSource !== REQUEST_SOURCE) return;
  await sendCustomerRejectedEmail({
    workshopName: ctx.workshopName,
    customerName: ctx.q.customerName,
    customerEmail: ctx.q.email,
    publicToken: ctx.q.publicToken!,
    vehicle: ctx.vehicle,
    reason: reason || null,
  });
}

/** Marca una solicitud como vista (cuando el taller abre el detalle). */
export async function markRequestViewed(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const q = await prisma.quotation.findFirst({
    where: { id, ...companyWhere(companyId), status: REQUEST_STATUS },
    select: { id: true, viewedByShopAt: true },
  });
  if (!q || q.viewedByShopAt) return;
  await prisma.quotation.update({
    where: { id },
    data: { viewedByShopAt: new Date() },
  });
}


/**
 * El taller envía la cotización terminada al cliente por correo.
 * Marca la cotización como respondida y, si estaba en DRAFT, la pasa a PENDING
 * (esperando la respuesta del cliente). Requiere que la cotización venga del
 * portal (tenga publicToken y email del cliente) y tenga un total > 0.
 */
export async function sendQuoteToCustomer(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const q = await prisma.quotation.findFirst({
    where: { id, ...companyWhere(companyId) },
    select: {
      id: true,
      status: true,
      publicToken: true,
      email: true,
      grandTotal: true,
    },
  });
  if (!q) throw new Error("Cotización no encontrada");
  if (!q.publicToken || !q.email) {
    throw new Error(
      "Esta cotización no tiene un cliente con correo para notificar",
    );
  }
  if (Number(q.grandTotal) <= 0) {
    throw new Error("Agrega precios a la cotización antes de enviarla");
  }
  if (q.status === "REJECTED" || q.status === "CONVERTED") {
    throw new Error("Esta cotización ya no se puede enviar");
  }

  const now = new Date();
  const nextStatus = q.status === "DRAFT" ? "PENDING" : q.status;

  await prisma.quotation.update({
    where: { id },
    data: { status: nextStatus, respondedAt: now, updatedAt: now },
  });

  const ctx = await loadNotifyContext(id);
  if (ctx) {
    await sendCustomerQuoteReadyEmail({
      workshopName: ctx.workshopName,
      customerName: ctx.q.customerName,
      customerEmail: ctx.q.email,
      publicToken: ctx.q.publicToken!,
      vehicle: ctx.vehicle,
      quotationNumber: ctx.q.quotationNumber > 0 ? ctx.q.quotationNumber : null,
      grandTotal: Number(ctx.q.grandTotal),
      estimatedDays: ctx.q.estimatedDays,
    });
  }

  return { id, sentTo: q.email };
}
