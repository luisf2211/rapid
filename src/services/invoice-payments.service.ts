import { prisma } from "@/lib/prisma";
import { toPlainNumber } from "@/lib/serialize";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import type { InvoicePaymentInput } from "@/lib/validations/invoice-payment";

export type InvoicePaymentRow = {
  Id: number;
  InvoiceId: number;
  PaymentNumber: number;
  Amount: number;
  PaymentMethod: string;
  BankName: string | null;
  Reference: string | null;
  Concept: string | null;
  ReceivedBy: string | null;
  DeliveredBy: string | null;
  PaymentDate: Date;
  Notes: string | null;
  CreatedAt: Date;
};

async function generatePaymentNumber(invoiceId: number): Promise<number> {
  const max = await prisma.invoicePayment.aggregate({
    where: { InvoiceId: invoiceId },
    _max: { PaymentNumber: true },
  });
  return (max._max.PaymentNumber ?? 0) + 1;
}

export async function listInvoicePayments(invoiceId: number): Promise<InvoicePaymentRow[]> {
  const payments = await prisma.invoicePayment.findMany({
    where: { InvoiceId: invoiceId },
    orderBy: { PaymentDate: "asc" },
  });
  return payments.map((p) => ({
    ...p,
    Amount: toPlainNumber(p.Amount) ?? 0,
  }));
}

export async function getInvoicePaymentById(paymentId: number) {
  return prisma.invoicePayment.findUnique({
    where: { Id: paymentId },
    include: {
      invoice: {
        select: {
          id: true,
          invoiceNumber: true,
          customerName: true,
          grandTotal: true,
          plate: true,
          brand: true,
          model: true,
          CompanyId: true,
        },
      },
    },
  });
}

export async function getInvoiceBalance(invoiceId: number): Promise<{
  grandTotal: number;
  totalPaid: number;
  balance: number;
}> {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    select: { grandTotal: true },
  });
  if (!invoice) throw new Error("Factura no encontrada");

  const agg = await prisma.invoicePayment.aggregate({
    where: { InvoiceId: invoiceId },
    _sum: { Amount: true },
  });

  const grandTotal = toPlainNumber(invoice.grandTotal) ?? 0;
  const totalPaid = toPlainNumber(agg._sum.Amount) ?? 0;
  const balance = Math.max(0, Math.round((grandTotal - totalPaid) * 100) / 100);

  return { grandTotal, totalPaid, balance };
}

export async function createInvoicePayment(invoiceId: number, input: InvoicePaymentInput) {
  const companyId = await requireCompanyIdFromSession();

  // Verify invoice belongs to company
  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId, ...companyWhere(companyId) },
  });
  if (!invoice) throw new Error("Factura no encontrada");
  if (invoice.status === "VOID") throw new Error("No se puede abonar a una factura anulada");

  // Check balance
  const { balance } = await getInvoiceBalance(invoiceId);
  const amount = Number(input.amount);
  if (amount <= 0) throw new Error("El monto debe ser mayor a 0");
  if (amount > balance + 0.01) throw new Error(`El monto excede el saldo pendiente (${balance.toFixed(2)})`);

  const paymentNumber = await generatePaymentNumber(invoiceId);

  const payment = await prisma.invoicePayment.create({
    data: {
      InvoiceId: invoiceId,
      PaymentNumber: paymentNumber,
      Amount: amount,
      PaymentMethod: input.paymentMethod,
      BankName: input.bankName?.trim() || null,
      Reference: input.reference?.trim() || null,
      Concept: input.concept?.trim() || null,
      ReceivedBy: input.receivedBy?.trim() || null,
      DeliveredBy: input.deliveredBy?.trim() || null,
      PaymentDate: input.paymentDate ? new Date(input.paymentDate) : new Date(),
      Notes: input.notes?.trim() || null,
      CreatedBy: input.receivedBy?.trim() || null,
    },
  });

  // If fully paid, mark invoice as PAID
  const newBalance = await getInvoiceBalance(invoiceId);
  if (newBalance.balance <= 0) {
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAt: new Date(),
        paidBy: input.receivedBy?.trim() || "Taller",
        updatedAt: new Date(),
      },
    });
  } else if (invoice.status === "INVOICED") {
    // Mark as partially paid
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "PARTIAL", updatedAt: new Date() },
    });
  }

  return payment;
}
