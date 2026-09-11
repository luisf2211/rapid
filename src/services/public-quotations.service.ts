import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { PublicQuoteRequestInput } from "@/lib/validations/public-quote";
import {
  sendWorkshopNewRequestEmail,
  sendCustomerRequestReceivedEmail,
  type QuoteRequestEmailData,
} from "@/lib/email/quote-request-emails";

/** Taller visible en el selector público de cotizaciones. */
export type PublicWorkshop = {
  slug: string;
  name: string;
  logoUrl: string | null;
  city: string | null;
  tagline: string | null;
  phone: string | null;
};

/** Lista los talleres marcados como públicos, destacados primero (publicRank asc). */
export async function listPublicWorkshops(): Promise<PublicWorkshop[]> {
  const companies = await prisma.company.findMany({
    where: { isActive: true, isPublicForQuotes: true },
    orderBy: [{ publicRank: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      logoUrl: true,
      publicCity: true,
      publicTagline: true,
      publicPhone: true,
      workshopSettings: {
        select: { phone: true, logoUrl: true, businessName: true },
        take: 1,
      },
    },
  });

  // El nombre, logo y teléfono salen de la configuración del taller
  // (módulo de Configuración) con respaldo en los campos públicos.
  return companies.map((c) => {
    const s = c.workshopSettings[0];
    return {
      slug: c.slug,
      name: s?.businessName?.trim() || c.name,
      logoUrl: s?.logoUrl || c.logoUrl,
      city: c.publicCity,
      tagline: c.publicTagline,
      phone: s?.phone?.trim() || c.publicPhone,
    };
  });
}

export async function getPublicWorkshopBySlug(
  slug: string,
): Promise<PublicWorkshop | null> {
  const c = await prisma.company.findFirst({
    where: { slug: slug.trim().toLowerCase(), isActive: true, isPublicForQuotes: true },
    select: {
      id: true,
      slug: true,
      name: true,
      logoUrl: true,
      publicCity: true,
      publicTagline: true,
      publicPhone: true,
    },
  });
  if (!c) return null;
  // El teléfono/logo/nombre del portal salen de la configuración del taller
  // (módulo de Configuración) con respaldo en los campos públicos.
  const settings = await prisma.workshopSettings
    .findFirst({
      where: { CompanyId: c.id },
      select: { phone: true, logoUrl: true, businessName: true },
    })
    .catch(() => null);
  return {
    slug: c.slug,
    name: settings?.businessName?.trim() || c.name,
    logoUrl: settings?.logoUrl || c.logoUrl,
    city: c.publicCity,
    tagline: c.publicTagline,
    phone: settings?.phone?.trim() || c.publicPhone,
  };
}

export type CreatePublicQuoteResult = {
  publicToken: string;
  workshopName: string;
};

/**
 * Crea una solicitud de cotización desde el portal público (cliente final).
 * No usa sesión: resuelve la empresa por slug. Deja la cotización en estado
 * PENDING para que el taller la revise. Devuelve un token público para
 * que el cliente pueda seguir el estado de su solicitud.
 */
export async function createPublicQuoteRequest(
  input: PublicQuoteRequestInput,
): Promise<CreatePublicQuoteResult> {
  const company = await prisma.company.findFirst({
    where: {
      slug: input.companySlug.trim().toLowerCase(),
      isActive: true,
      isPublicForQuotes: true,
    },
    select: {
      id: true,
      name: true,
      workshopSettings: { select: { businessName: true }, take: 1 },
    },
  });

  if (!company) {
    throw new Error("El taller seleccionado no está disponible");
  }

  const workshopName =
    company.workshopSettings[0]?.businessName?.trim() || company.name;

  const publicToken = randomUUID().replace(/-/g, "");

  const photos = (input.photos ?? [])
    .filter((p) => p.photoUrl?.trim())
    .map((p) => ({
      photoUrl: p.photoUrl.trim(),
      category: "INSPECTION",
      description: null as string | null,
    }));

  // Transacción: genera el número secuencial por empresa y crea la cotización
  // dentro del mismo scope para reducir colisiones bajo concurrencia.
  // Las solicitudes NO consumen número de cotización hasta que el taller
  // las acepta (se asigna el número real en acceptRequest). Usamos un
  // número negativo único por empresa como placeholder para no colisionar
  // con la secuencia real ni con otras solicitudes pendientes.
  const created = await prisma.$transaction(async (tx) => {
    const minPlaceholder = await tx.quotation.aggregate({
      where: { CompanyId: company.id, quotationNumber: { lt: 0 } },
      _min: { quotationNumber: true },
    });
    const quotationNumber = Math.min(0, minPlaceholder._min.quotationNumber ?? 0) - 1;

    return tx.quotation.create({
      data: {
        quotationNumber,
        company: { connect: { id: company.id } },
        quotationType: "PRIVATE",
        status: "REQUESTED",
        customerName: input.customerName.trim(),
        phone: input.phone.trim(),
        email: input.email?.trim() || null,
        brand: input.brand?.trim() || null,
        model: input.model?.trim() || null,
        vehicleYear: input.vehicleYear ?? null,
        color: input.color?.trim() || null,
        plate: input.plate?.trim() || null,
        customerMessage: input.message.trim(),
        internalNotes: `Solicitud del cliente (portal): ${input.message.trim()}`,
        requestSource: "CUSTOMER_PORTAL",
        publicToken,
        laborSubtotal: 0,
        materialSubtotal: 0,
        partsSubtotal: 0,
        taxRate: 0,
        taxAmount: 0,
        discountAmount: 0,
        grandTotal: 0,
        updatedAt: new Date(),
        photos: photos.length ? { create: photos } : undefined,
      },
      select: { id: true },
    });
  });

  // Notificaciones por correo (best-effort, no bloquea la respuesta al cliente).
  await notifyNewRequest({
    companyId: company.id,
    workshopName,
    requestId: created.id,
    publicToken,
    input,
    photoCount: photos.length,
  }).catch((e) => {
    console.error("[public-quote] notify failed:", e);
  });

  return {
    publicToken,
    workshopName,
  };
}

async function notifyNewRequest(args: {
  companyId: number;
  workshopName: string;
  requestId: number;
  publicToken: string;
  input: PublicQuoteRequestInput;
  photoCount: number;
}): Promise<void> {
  const { input } = args;

  // Emails de los administradores del taller.
  const admins = await prisma.user.findMany({
    where: {
      companyId: args.companyId,
      isActive: true,
      role: { in: ["COMPANY_ADMIN", "COMPANY_USER"] },
    },
    select: { email: true, role: true },
  });
  // Prioriza admins; si no hay, usa cualquier usuario activo del taller.
  const adminEmails = admins
    .filter((u) => u.role === "COMPANY_ADMIN")
    .map((u) => u.email);
  const fallbackEmails = admins.map((u) => u.email);
  const notifyEnv = process.env.QUOTE_REQUEST_NOTIFY_EMAIL;
  const workshopEmails = Array.from(
    new Set(
      [
        ...(adminEmails.length ? adminEmails : fallbackEmails),
        ...(notifyEnv ? [notifyEnv] : []),
      ].filter(Boolean),
    ),
  );

  const vehicle = [input.brand, input.model, input.vehicleYear?.toString()]
    .filter(Boolean)
    .join(" · ");

  const data: QuoteRequestEmailData = {
    workshopName: args.workshopName,
    workshopEmails,
    requestId: args.requestId,
    publicToken: args.publicToken,
    customerName: input.customerName.trim(),
    customerEmail: input.email?.trim() || null,
    phone: input.phone.trim(),
    vehicle,
    plate: input.plate?.trim() || null,
    message: input.message.trim(),
    photoCount: args.photoCount,
  };

  await Promise.allSettled([
    sendWorkshopNewRequestEmail(data),
    sendCustomerRequestReceivedEmail(data),
  ]);
}

export type PublicQuoteTracking = {
  publicToken: string;
  quotationNumber: number | null;
  status: string;
  createdAt: Date;
  viewedByShopAt: Date | null;
  respondedAt: Date | null;
  customerName: string;
  customerMessage: string | null;
  vehicle: {
    brand: string | null;
    model: string | null;
    vehicleYear: number | null;
    color: string | null;
    plate: string | null;
  };
  grandTotal: number;
  estimatedDays: number | null;
  validUntil: Date | null;
  rejectionReason: string | null;
  workshop: {
    name: string;
    phone: string | null;
    city: string | null;
    logoUrl: string | null;
  };
  photos: { id: number; photoUrl: string }[];
};

/** Rastrea una solicitud por su token público (sin sesión). */
export async function getPublicQuoteByToken(
  token: string,
): Promise<PublicQuoteTracking | null> {
  const q = await prisma.quotation.findUnique({
    where: { publicToken: token.trim() },
    include: {
      company: {
        select: {
          id: true,
          name: true,
          publicPhone: true,
          publicCity: true,
          logoUrl: true,
          workshopSettings: {
            select: { phone: true, logoUrl: true, businessName: true },
            take: 1,
          },
        },
      },
      photos: { orderBy: { id: "asc" }, select: { id: true, photoUrl: true } },
    },
  });

  if (!q) return null;

  return {
    publicToken: q.publicToken!,
    // Número visible solo cuando ya es una cotización real (no solicitud placeholder).
    quotationNumber: q.quotationNumber > 0 ? q.quotationNumber : null,
    status: q.status,
    createdAt: q.createdAt,
    viewedByShopAt: q.viewedByShopAt,
    respondedAt: q.respondedAt,
    customerName: q.customerName,
    customerMessage: q.customerMessage,
    vehicle: {
      brand: q.brand,
      model: q.model,
      vehicleYear: q.vehicleYear,
      color: q.color,
      plate: q.plate,
    },
    grandTotal: Number(q.grandTotal),
    estimatedDays: q.estimatedDays,
    validUntil: q.validUntil,
    rejectionReason: q.rejectionReason,
    workshop: {
      name: q.company.workshopSettings[0]?.businessName?.trim() || q.company.name,
      phone: q.company.workshopSettings[0]?.phone?.trim() || q.company.publicPhone,
      city: q.company.publicCity,
      logoUrl: q.company.workshopSettings[0]?.logoUrl || q.company.logoUrl,
    },
    photos: q.photos.map((p) => ({ id: p.id, photoUrl: p.photoUrl })),
  };
}
