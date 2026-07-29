import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { toPlainNumber } from "@/lib/serialize";
import type { BankAccountInput, BankTransactionInput } from "@/lib/validations/bank";

// ─── Bank Accounts ──────────────────────────────────────────────────────────

export async function listBankAccounts() {
  const companyId = await requireCompanyIdFromSession();
  return prisma.bankAccount.findMany({
    where: { ...companyWhere(companyId), IsActive: true },
    orderBy: { AccountName: "asc" },
  });
}

export async function getAllBankAccounts() {
  const companyId = await requireCompanyIdFromSession();
  return prisma.bankAccount.findMany({
    where: companyWhere(companyId),
    orderBy: { CreatedAt: "desc" },
  });
}

export async function getBankAccount(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.bankAccount.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
  });
}

export async function createBankAccount(input: BankAccountInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.bankAccount.create({
    data: {
      CompanyId: companyId,
      AccountName: input.accountName,
      BankName: input.bankName,
      AccountNumber: input.accountNumber || null,
      AccountType: input.accountType || "CHECKING",
      Currency: input.currency || "DOP",
      CurrentBalance: input.initialBalance ?? 0,
      Notes: input.notes || null,
    },
  });
}

export async function updateBankAccount(id: number, input: BankAccountInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.bankAccount.update({
    where: { Id: id, CompanyId: companyId },
    data: {
      AccountName: input.accountName,
      BankName: input.bankName,
      AccountNumber: input.accountNumber || null,
      AccountType: input.accountType || "CHECKING",
      Currency: input.currency || "DOP",
      Notes: input.notes || null,
      UpdatedAt: new Date(),
    },
  });
}

export async function deleteBankAccount(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.bankAccount.update({
    where: { Id: id, CompanyId: companyId },
    data: { IsActive: false, UpdatedAt: new Date() },
  });
}

// ─── Bank Transactions ──────────────────────────────────────────────────────

export async function listBankTransactions(bankAccountId: number, opts?: { take?: number }) {
  const companyId = await requireCompanyIdFromSession();
  // Verify ownership
  const account = await prisma.bankAccount.findFirst({
    where: { Id: bankAccountId, ...companyWhere(companyId) },
  });
  if (!account) throw new Error("Cuenta no encontrada");

  return prisma.bankTransaction.findMany({
    where: { BankAccountId: bankAccountId },
    orderBy: { TransactionDate: "desc" },
    take: opts?.take ?? 100,
  });
}

export async function createBankTransaction(input: BankTransactionInput) {
  const companyId = await requireCompanyIdFromSession();
  const account = await prisma.bankAccount.findFirst({
    where: { Id: input.bankAccountId, ...companyWhere(companyId) },
  });
  if (!account) throw new Error("Cuenta no encontrada");

  const currentBalance = toPlainNumber(account.CurrentBalance) ?? 0;
  const amount = input.amount;
  const newBalance =
    input.transactionType === "CREDIT"
      ? currentBalance + amount
      : currentBalance - amount;

  const [transaction] = await prisma.$transaction([
    prisma.bankTransaction.create({
      data: {
        BankAccountId: input.bankAccountId,
        TransactionType: input.transactionType,
        Amount: amount,
        BalanceAfter: newBalance,
        Description: input.description,
        Reference: input.reference || null,
        TransactionDate: new Date(input.transactionDate),
        Category: input.category || null,
        Notes: input.notes || null,
      },
    }),
    prisma.bankAccount.update({
      where: { Id: input.bankAccountId },
      data: { CurrentBalance: newBalance, UpdatedAt: new Date() },
    }),
  ]);

  return transaction;
}

// ─── Totals ─────────────────────────────────────────────────────────────────

export async function getBankAccountsTotalBalance() {
  const companyId = await requireCompanyIdFromSession();
  const result = await prisma.bankAccount.aggregate({
    where: { ...companyWhere(companyId), IsActive: true },
    _sum: { CurrentBalance: true },
  });
  return toPlainNumber(result._sum.CurrentBalance) ?? 0;
}
