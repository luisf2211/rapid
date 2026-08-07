import "@/app/print/thermal-ticket.css";
import { notFound } from "next/navigation";
import { getLaborOrderById } from "@/services/labor-orders.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildLaborOrderPrintData } from "@/lib/labor-order/print-data";
import { laborOrderWorkerName } from "@/lib/labor-order/worker-name";
import { LaborOrderTicket } from "@/components/labor-order/print/LaborOrderTicket";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function LaborOrderTicketPage({
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

  const lo = await getLaborOrderById(id);
  if (!lo) notFound();

  const workshop = await getWorkshopPrintInfo();
  const data = buildLaborOrderPrintData(lo, laborOrderWorkerName(lo));
  const backHref = `/labor-orders/${id}`;
  const autoPrint = auto === "1";

  return (
    <>
      <PrintToolbar
        backHref={backHref}
        backLabel="Volver"
        autoPrint={autoPrint}
      />
      <LaborOrderTicket data={data} workshop={workshop} />
    </>
  );
}
