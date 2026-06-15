import "@/app/print/invoice-print.css";
import { notFound } from "next/navigation";
import { getEmployeePaymentById } from "@/services/payroll.service";
import { getWorkshopPrintInfo } from "@/lib/workshop/print-info";
import { buildEmployeePaymentPrintData } from "@/lib/payments/print-data";
import { EmployeePaymentDocument } from "@/components/payments/print/EmployeePaymentDocument";
import { PrintToolbar } from "@/components/quotation/print/PrintToolbar";

export const dynamic = "force-dynamic";

export default async function PaymentPrintPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string }>;
}) {
  const id = Number((await params).id);
  const { auto } = await searchParams;
  if (!Number.isFinite(id)) notFound();

  const payment = await getEmployeePaymentById(id);
  if (!payment) notFound();

  const workshop = await getWorkshopPrintInfo();
  const data = buildEmployeePaymentPrintData(payment);

  return (
    <>
      <PrintToolbar backHref="/payments" autoPrint={auto === "1"} />
      <div style={{ padding: 16 }}>
        <EmployeePaymentDocument data={data} workshop={workshop} />
      </div>
    </>
  );
}
