import "@/app/print/invoice-print.css";
import "@/app/print/reception-print.css";
import { notFound } from "next/navigation";
import { getWorkOrderForReceptionPrint } from "@/services/work-orders.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildReceptionPrintData } from "@/lib/work-order/reception-print-data";
import { ReceptionOrderDocument } from "@/components/work-order/print/ReceptionOrderDocument";
import { DamageInspectionPage } from "@/components/work-order/print/DamageInspectionPage";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

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
  const backHref = `/work-orders/${id}`;
  const autoPrint = auto === "1";

  return (
    <>
      <PrintToolbar
        backHref={backHref}
        backLabel="Volver a la orden"
        autoPrint={autoPrint}
      />
      <div style={{ padding: "16px" }}>
        <ReceptionOrderDocument data={data} workshop={workshop} />
        {data.damages.length > 0 && (
          <DamageInspectionPage
            data={data}
            orderNumber={data.docNumber}
            customerName={data.customerName}
            plate={data.plate}
          />
        )}
      </div>
    </>
  );
}
