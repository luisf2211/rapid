import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { toPlainNumber } from "@/lib/serialize";
import type {
  PettyCashFundInput,
  PettyCashTransactionInput,
} from "@/lib/validations/petty-cash";

// ─── Petty Cash Funds ───────────────────────────────────────────────────────

export async function listPettyCashFunds() {
  const companyId = await requireCompanyIdFromSession();
  return prisma.pettyCashFund.findMany({
    where: { ...companyWhere(companyId), IsActive: true },
    orderBy: { Name: "asc" },
  });
}

export async function getPettyCashFund(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.pettyCashFund.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
  });
}

export async function createPettyCashFund(input: PettyCashFundInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.pettyCashFund.create({
    data: {
      CompanyId: companyId,
      Name: input.name,
      FundLimit: input.fundLimit,
      CurrentBalance: input.fundLimit, // Starts fully funded
      Custodian: input.custodian || null,
    },
  });
}

export async function updatePettyCashFund(id: number, input: PettyCashFundInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.pettyCashFund.update({
    where: { Id: id, CompanyId: companyId },
    data: {
      Name: input.name,
      FundLimit: input.fundLimit,
      Custodian: input.custodian || null,
      UpdatedAt: new Date(),
    },
  });
}

export async function deletePettyCashFund(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.pettyCashFund.update({
    where: { Id: id, CompanyId: companyId },
    data: { IsActive: false, UpdatedAt: new Date() },
  });
}

// ─── Petty Cash Transactions ────────────────────────────────────────────────

export async function listPettyCashTransactions(
  fundId: number,
  opts?: { take?: number },
) {
  const companyId = await requireCompanyIdFromSession();
  // Verify ownership
  const fund = await prisma.pettyCashFund.findFirst({
    where: { Id: fundId, ...companyWhere(companyId) },
  });
  if (!fund) throw new Error("Fondo no encontrado");

  return prisma.pettyCashTransaction.findMany({
    where: { PettyCashFundId: fundId },
    orderBy: { TransactionDate: "desc" },
    take: opts?.take ?? 100,
  });
}

export async function createPettyCashTransaction(
  input: PettyCashTransactionInput,
) {
  const companyId = await requireCompanyIdFromSession();
  const fund = await prisma.pettyCashFund.findFirst({
    where: { Id: input.pettyCashFundId, ...companyWhere(companyId) },
  });
  if (!fund) throw new Error("Fondo no encontrado");

  const currentBalance = toPlainNumber(fund.CurrentBalance) ?? 0;
  const fundLimit = toPlainNumber(fund.FundLimit) ?? 0;
  const amount = input.amount;

  let newBalance: number;
  if (input.transactionType === "REPLENISHMENT") {
    newBalance = currentBalance + amount;
    if (newBalance > fundLimit) {
      throw new Error(
        `La reposición excede el límite del fondo (${fundLimit.toFixed(2)})`,
      );
    }
  } else {
    // DISBURSEMENT
    if (amount > currentBalance) {
      throw new Error(
        `Fondos insuficientes. Balance actual: ${currentBalance.toFixed(2)}`,
      );
    }
    newBalance = currentBalance - amount;
  }

  const [transaction] = await prisma.$transaction([
    prisma.pettyCashTransaction.create({
      data: {
        PettyCashFundId: input.pettyCashFundId,
        TransactionType: input.transactionType,
        Amount: amount,
        BalanceAfter: newBalance,
        Description: input.description,
        TransactionDate: new Date(input.transactionDate),
        Notes: input.notes || null,
      },
    }),
    prisma.pettyCashFund.update({
      where: { Id: input.pettyCashFundId },
      data: { CurrentBalance: newBalance, UpdatedAt: new Date() },
    }),
  ]);

  return transaction;
}

// ─── Totals ─────────────────────────────────────────────────────────────────

export async function getPettyCashTotalBalance() {
  const companyId = await requireCompanyIdFromSession();
  const result = await prisma.pettyCashFund.aggregate({
    where: { ...companyWhere(companyId), IsActive: true },
    _sum: { CurrentBalance: true },
  });
  return toPlainNumber(result._sum.CurrentBalance) ?? 0;
}
