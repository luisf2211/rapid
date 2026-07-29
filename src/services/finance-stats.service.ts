import { prisma } from "@/lib/prisma";
import { requireCompanyIdFromSession, companyWhere } from "@/lib/auth/tenant";
import { toPlainNumber } from "@/lib/serialize";

export type FinanceStats = {
  income: number;
  internalCosts: number;
  expenses: number;
  netProfit: number;
  invoiceCount: number;
  expenseCount: number;
  bankBalance: number;
  pettyCashBalance: number;
  expensesByCategory: {
    categoryName: string;
    color: string;
    total: number;
  }[];
  monthlyIncome: { month: string; amount: number }[];
  monthlyExpenses: { month: string; amount: number }[];
};

export async function getFinanceStats(opts?: {
  from?: Date;
  to?: Date;
}): Promise<FinanceStats> {
  const companyId = await requireCompanyIdFromSession();

  const dateFilter = opts?.from || opts?.to
    ? {
        ...(opts.from ? { gte: opts.from } : {}),
        ...(opts.to ? { lte: opts.to } : {}),
      }
    : undefined;

  const [
    incomeAgg,
    invoiceCount,
    materialCostAgg,
    laborCostAgg,
    expenseAgg,
    expenseCount,
    bankBalanceAgg,
    pettyCashBalanceAgg,
    expensesByCategory,
  ] = await Promise.all([
    // Income: paid invoices (not voided)
    prisma.invoice.aggregate({
      where: {
        ...companyWhere(companyId),
        status: "PAID",
        voidedAt: null,
        ...(dateFilter ? { paidAt: dateFilter } : {}),
      },
      _sum: { grandTotal: true },
    }),
    prisma.invoice.count({
      where: {
        ...companyWhere(companyId),
        status: "PAID",
        voidedAt: null,
        ...(dateFilter ? { paidAt: dateFilter } : {}),
      },
    }),
    // Internal costs: materials
    prisma.materialRequisition.aggregate({
      where: {
        workOrder: companyWhere(companyId),
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    // Internal costs: labor
    prisma.laborOrder.aggregate({
      where: {
        workOrder: companyWhere(companyId),
        ...(dateFilter ? { createdAt: dateFilter } : {}),
      },
      _sum: { total: true },
    }),
    // Expenses
    prisma.expense.aggregate({
      where: {
        ...companyWhere(companyId),
        ...(dateFilter ? { ExpenseDate: dateFilter } : {}),
      },
      _sum: { Amount: true },
    }),
    prisma.expense.count({
      where: {
        ...companyWhere(companyId),
        ...(dateFilter ? { ExpenseDate: dateFilter } : {}),
      },
    }),
    // Bank balance (current, not filtered by date)
    prisma.bankAccount.aggregate({
      where: { ...companyWhere(companyId), IsActive: true },
      _sum: { CurrentBalance: true },
    }),
    // Petty cash balance
    prisma.pettyCashFund.aggregate({
      where: { ...companyWhere(companyId), IsActive: true },
      _sum: { CurrentBalance: true },
    }),
    // Expenses by category
    prisma.expense.groupBy({
      by: ["CategoryId"],
      where: {
        ...companyWhere(companyId),
        ...(dateFilter ? { ExpenseDate: dateFilter } : {}),
      },
      _sum: { Amount: true },
    }),
  ]);

  const income = toPlainNumber(incomeAgg._sum.grandTotal) ?? 0;
  const materialCosts = toPlainNumber(materialCostAgg._sum.total) ?? 0;
  const laborCosts = toPlainNumber(laborCostAgg._sum.total) ?? 0;
  const internalCosts = materialCosts + laborCosts;
  const expenses = toPlainNumber(expenseAgg._sum.Amount) ?? 0;
  const netProfit = income - internalCosts - expenses;
  const bankBalance = toPlainNumber(bankBalanceAgg._sum.CurrentBalance) ?? 0;
  const pettyCashBalance = toPlainNumber(pettyCashBalanceAgg._sum.CurrentBalance) ?? 0;

  // Resolve category names
  const categories = await prisma.expenseCategory.findMany({
    where: companyWhere(companyId),
  });
  const catMap = new Map(categories.map((c) => [c.Id, c]));

  const expByCat = expensesByCategory
    .map((r) => ({
      categoryName: catMap.get(r.CategoryId)?.Name ?? "Sin categoría",
      color: catMap.get(r.CategoryId)?.Color ?? "#6b7280",
      total: toPlainNumber(r._sum.Amount) ?? 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Monthly income (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const paidInvoices = await prisma.invoice.findMany({
    where: {
      ...companyWhere(companyId),
      status: "PAID",
      voidedAt: null,
      paidAt: { gte: sixMonthsAgo },
    },
    select: { paidAt: true, grandTotal: true },
  });

  const monthlyIncomeMap = new Map<string, number>();
  const monthlyExpensesMap = new Map<string, number>();

  for (let i = 0; i < 6; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyIncomeMap.set(key, 0);
    monthlyExpensesMap.set(key, 0);
  }

  for (const inv of paidInvoices) {
    if (!inv.paidAt) continue;
    const key = `${inv.paidAt.getFullYear()}-${String(inv.paidAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyIncomeMap.has(key)) {
      monthlyIncomeMap.set(key, (monthlyIncomeMap.get(key) ?? 0) + (toPlainNumber(inv.grandTotal) ?? 0));
    }
  }

  const expensesInPeriod = await prisma.expense.findMany({
    where: {
      ...companyWhere(companyId),
      ExpenseDate: { gte: sixMonthsAgo },
    },
    select: { ExpenseDate: true, Amount: true },
  });

  for (const exp of expensesInPeriod) {
    const key = `${exp.ExpenseDate.getFullYear()}-${String(exp.ExpenseDate.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyExpensesMap.has(key)) {
      monthlyExpensesMap.set(key, (monthlyExpensesMap.get(key) ?? 0) + (toPlainNumber(exp.Amount) ?? 0));
    }
  }

  const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const monthlyIncome = Array.from(monthlyIncomeMap.entries()).map(([key, amount]) => ({
    month: monthNames[parseInt(key.split("-")[1]) - 1],
    amount,
  }));
  const monthlyExpenses = Array.from(monthlyExpensesMap.entries()).map(([key, amount]) => ({
    month: monthNames[parseInt(key.split("-")[1]) - 1],
    amount,
  }));

  return {
    income,
    internalCosts,
    expenses,
    netProfit,
    invoiceCount,
    expenseCount,
    bankBalance,
    pettyCashBalance,
    expensesByCategory: expByCat,
    monthlyIncome,
    monthlyExpenses,
  };
}
