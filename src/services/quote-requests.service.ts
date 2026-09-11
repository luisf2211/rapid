import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";

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

  return prisma.$transaction(async (tx) => {
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

  return prisma.quotation.update({
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
