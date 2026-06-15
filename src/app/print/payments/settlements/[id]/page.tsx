import "@/app/print/invoice-print.css";
import { notFound } from "next/navigation";
import { getPayrollSettlementById } from "@/services/payroll.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildSettlementPrintData } from "@/lib/payments/print-data";
import { EmployeePaymentDocument } from "@/components/payments/print/EmployeePaymentDocument";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function SettlementPrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = Number((await params).id);
  if (!Number.isFinite(id)) notFound();

  const settlement = await getPayrollSettlementById(id);
  if (!settlement) notFound();

  const workshop = await getWorkshopPrintInfo();
  const s = buildSettlementPrintData(settlement);
  const data = {
    docTitle: s.docTitle,
    docNumber: "PREVIEW",
    paymentType: "Liquidación",
    paymentDate: s.periodLabel,
    employeeName: settlement.Employee.Name,
    employeeRole: settlement.Employee.Role,
    nationalId: s.nationalId,
    amount: s.net,
    paymentMethod: "—",
    reference: "—",
    notes: "",
    paidBy: "—",
    periodLabel: s.periodLabel,
    lines: s.lines,
    gross: s.gross,
    advances: s.advances,
    adjustments: s.adjustments,
    net: s.net,
  };

  return (
    <>
      <PrintToolbar backHref={`/payments/periods/${settlement.PayrollPeriodId}`} />
      <div style={{ padding: 16 }}>
        <EmployeePaymentDocument data={data} workshop={workshop} />
      </div>
    </>
  );
}
