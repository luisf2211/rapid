import "@/app/print/invoice-print.css";
import "@/app/print/reception-print.css";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { prisma } from "@/lib/prisma";
import { getWorkOrderForReceptionPrint } from "@/services/work-orders.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildReceptionPrintData } from "@/lib/work-order/reception-print-data";
import { ReceptionOrderDocument } from "@/components/work-order/print/ReceptionOrderDocument";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";
import { SITE_URL } from "@/lib/seo/config";

export const dynamic = "force-dynamic";

/** URL pública de condiciones del taller + su QR (data-URL). */
async function buildTerms(companyId: number) {
  const company = await prisma.company
    .findUnique({ where: { id: companyId }, select: { slug: true } })
    .catch(() => null);
  if (!company?.slug) return { termsUrl: null, termsQrDataUrl: null };

  const termsUrl = `${SITE_URL}/terminos/${company.slug}`;
  const termsQrDataUrl = await QRCode.toDataURL(termsUrl, {
    margin: 0,
    width: 220,
    errorCorrectionLevel: "M",
  }).catch(() => null);
  return { termsUrl, termsQrDataUrl };
}

export default async function WorkOrderReceptionPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const { id: idParam } = await params;
  const { auto } = await searchParams;
  const id = Number(idParam);
  if (!Number.isFinite(id)) notFound();

  const order = await getWorkOrderForReceptionPrint(id);
  if (!order) notFound();

  const workshop = await getWorkshopPrintInfo();
  const data = buildReceptionPrintData(order, workshop);
  const { termsUrl, termsQrDataUrl } = await buildTerms(order.CompanyId);
  const backHref = `/work-orders/${id}`;
  const autoPrint = auto === "1";
  const brandColor = workshop.brandColor ?? "#c41e3a";

  return (
    <>
      <PrintToolbar
        backHref={backHref}
        backLabel="Volver a la orden"
        autoPrint={autoPrint}
      />
      <div style={{ padding: "16px", "--brand-color": brandColor } as React.CSSProperties}>
        <ReceptionOrderDocument
          data={data}
          workshop={workshop}
          termsUrl={termsUrl}
          termsQrDataUrl={termsQrDataUrl}
        />
      </div>
    </>
  );
}
