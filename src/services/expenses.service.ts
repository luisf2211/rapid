import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { toPlainNumber } from "@/lib/serialize";
import type { ExpenseFormInput, ExpenseCategoryInput } from "@/lib/validations/expense";

// ─── Expense Categories ─────────────────────────────────────────────────────

export async function listExpenseCategories() {
  const companyId = await requireCompanyIdFromSession();
  return prisma.expenseCategory.findMany({
    where: { ...companyWhere(companyId), IsActive: true },
    orderBy: { Name: "asc" },
  });
}

export async function createExpenseCategory(input: ExpenseCategoryInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.expenseCategory.create({
    data: {
      CompanyId: companyId,
      Name: input.name,
      Color: input.color || null,
    },
  });
}

export async function updateExpenseCategory(id: number, input: ExpenseCategoryInput) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.expenseCategory.update({
    where: { Id: id, ...companyWhere(companyId) },
    data: {
      Name: input.name,
      Color: input.color || null,
    },
  });
}

export async function deleteExpenseCategory(id: number) {
  const companyId = await requireCompanyIdFromSession();
  // Soft-delete
  return prisma.expenseCategory.update({
    where: { Id: id, ...companyWhere(companyId) },
    data: { IsActive: false },
  });
}

// ─── Expenses ───────────────────────────────────────────────────────────────

async function generateExpenseNumber(companyId: number): Promise<number> {
  const max = await prisma.expense.aggregate({
    where: companyWhere(companyId),
    _max: { ExpenseNumber: true },
  });
  return (max._max.ExpenseNumber ?? 0) + 1;
}

/** Resolve category by name — creates it if it doesn't exist. */
async function resolveCategory(companyId: number, categoryName: string): Promise<number> {
  const name = categoryName.trim();
  const existing = await prisma.expenseCategory.findFirst({
    where: { CompanyId: companyId, Name: { equals: name, mode: "insensitive" } },
  });
  if (existing) return existing.Id;

  const created = await prisma.expenseCategory.create({
    data: { CompanyId: companyId, Name: name },
  });
  return created.Id;
}

export async function listExpenses(opts?: {
  search?: string;
  categoryId?: number;
  from?: string;
  to?: string;
}) {
  const companyId = await requireCompanyIdFromSession();

  const where: Record<string, unknown> = { ...companyWhere(companyId) };

  if (opts?.search) {
    where.OR = [
      { Description: { contains: opts.search, mode: "insensitive" } },
      { Supplier: { contains: opts.search, mode: "insensitive" } },
      { Reference: { contains: opts.search, mode: "insensitive" } },
    ];
  }

  if (opts?.categoryId) {
    where.CategoryId = opts.categoryId;
  }

  if (opts?.from || opts?.to) {
    where.ExpenseDate = {};
    if (opts?.from) (where.ExpenseDate as Record<string, unknown>).gte = new Date(opts.from);
    if (opts?.to) (where.ExpenseDate as Record<string, unknown>).lte = new Date(opts.to);
  }

  return prisma.expense.findMany({
    where: where as never,
    include: { category: true },
    orderBy: { ExpenseDate: "desc" },
    take: 200,
  });
}

export async function getExpense(id: number) {
  const companyId = await requireCompanyIdFromSession();
  return prisma.expense.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
    include: { category: true, bankAccount: true },
  });
}

export async function createExpense(input: ExpenseFormInput) {
  const companyId = await requireCompanyIdFromSession();
  const expenseNumber = await generateExpenseNumber(companyId);
  const categoryId = await resolveCategory(companyId, input.categoryId);

  const expense = await prisma.expense.create({
    data: {
      CompanyId: companyId,
      ExpenseNumber: expenseNumber,
      CategoryId: categoryId,
      Description: input.description,
      Amount: input.amount,
      ExpenseDate: new Date(input.expenseDate),
      Supplier: input.supplier || null,
      Reference: input.reference || null,
      Notes: input.notes || null,
      PaymentMethod: input.paymentMethod || null,
      BankAccountId: input.bankAccountId || null,
    },
  });

  // Si tiene cuenta bancaria, descontar el balance
  if (input.bankAccountId) {
    await prisma.bankAccount.update({
      where: { Id: input.bankAccountId },
      data: { CurrentBalance: { decrement: input.amount } },
    });
  }

  return expense;
}

export async function updateExpense(id: number, input: ExpenseFormInput) {
  const companyId = await requireCompanyIdFromSession();

  // Get the old expense to revert bank balance if changed
  const old = await prisma.expense.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
  });
  if (!old) throw new Error("Gasto no encontrado");

  const oldAmount = toPlainNumber(old.Amount) ?? 0;
  const oldBankId = old.BankAccountId;

  const expense = await prisma.expense.update({
    where: { Id: id },
    data: {
      CategoryId: await resolveCategory(companyId, input.categoryId),
      Description: input.description,
      Amount: input.amount,
      ExpenseDate: new Date(input.expenseDate),
      Supplier: input.supplier || null,
      Reference: input.reference || null,
      Notes: input.notes || null,
      PaymentMethod: input.paymentMethod || null,
      BankAccountId: input.bankAccountId || null,
      UpdatedAt: new Date(),
    },
  });

  // Revert old bank balance
  if (oldBankId) {
    await prisma.bankAccount.update({
      where: { Id: oldBankId },
      data: { CurrentBalance: { increment: oldAmount } },
    });
  }

  // Apply new bank balance
  if (input.bankAccountId) {
    await prisma.bankAccount.update({
      where: { Id: input.bankAccountId },
      data: { CurrentBalance: { decrement: input.amount } },
    });
  }

  return expense;
}

export async function deleteExpense(id: number) {
  const companyId = await requireCompanyIdFromSession();
  const expense = await prisma.expense.findFirst({
    where: { Id: id, ...companyWhere(companyId) },
  });
  if (!expense) throw new Error("Gasto no encontrado");

  // Revert bank balance if applicable
  const amount = toPlainNumber(expense.Amount) ?? 0;
  if (expense.BankAccountId) {
    await prisma.bankAccount.update({
      where: { Id: expense.BankAccountId },
      data: { CurrentBalance: { increment: amount } },
    });
  }

  return prisma.expense.delete({ where: { Id: id } });
}

// ─── Totals for Dashboard ───────────────────────────────────────────────────

export async function getExpenseTotals(opts?: { from?: Date; to?: Date }) {
  const companyId = await requireCompanyIdFromSession();

  const where: Record<string, unknown> = { ...companyWhere(companyId) };
  if (opts?.from || opts?.to) {
    where.ExpenseDate = {};
    if (opts.from) (where.ExpenseDate as Record<string, unknown>).gte = opts.from;
    if (opts.to) (where.ExpenseDate as Record<string, unknown>).lte = opts.to;
  }

  const result = await prisma.expense.aggregate({
    where: where as never,
    _sum: { Amount: true },
    _count: { Id: true },
  });

  return {
    totalAmount: toPlainNumber(result._sum.Amount) ?? 0,
    count: result._count.Id,
  };
}

export async function getExpensesByCategory(opts?: { from?: Date; to?: Date }) {
  const companyId = await requireCompanyIdFromSession();

  const where: Record<string, unknown> = { ...companyWhere(companyId) };
  if (opts?.from || opts?.to) {
    where.ExpenseDate = {};
    if (opts.from) (where.ExpenseDate as Record<string, unknown>).gte = opts.from;
    if (opts.to) (where.ExpenseDate as Record<string, unknown>).lte = opts.to;
  }

  const result = await prisma.expense.groupBy({
    by: ["CategoryId"],
    where: where as never,
    _sum: { Amount: true },
    _count: { Id: true },
  });

  const categories = await prisma.expenseCategory.findMany({
    where: { ...companyWhere(companyId) },
  });

  const catMap = new Map(categories.map((c) => [c.Id, c]));

  return result.map((r) => ({
    categoryId: r.CategoryId,
    categoryName: catMap.get(r.CategoryId)?.Name ?? "Sin categoría",
    color: catMap.get(r.CategoryId)?.Color ?? "#6b7280",
    total: toPlainNumber(r._sum.Amount) ?? 0,
    count: r._count.Id,
  }));
}
