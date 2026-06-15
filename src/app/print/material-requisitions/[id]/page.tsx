import "@/app/print/invoice-print.css";
import { notFound } from "next/navigation";
import { getMaterialRequisitionById } from "@/services/material-requisitions.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildMaterialRequisitionPrintData } from "@/lib/material-requisition/print-data";
import { MaterialRequisitionDocument } from "@/components/material-requisition/print/MaterialRequisitionDocument";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function MaterialRequisitionPrintPage({
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

  const req = await getMaterialRequisitionById(id);
  if (!req) notFound();

  const workshop = await getWorkshopPrintInfo();
  const data = buildMaterialRequisitionPrintData(req);
  const backHref = `/material-requisitions/${id}`;
  const autoPrint = auto === "1";

  return (
    <>
      <PrintToolbar backHref={backHref} autoPrint={autoPrint} />
      <div style={{ padding: "16px" }}>
        <MaterialRequisitionDocument data={data} workshop={workshop} />
      </div>
    </>
  );
}
