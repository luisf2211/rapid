import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { getExpense, listExpenseCategories } from "@/services/expenses.service";
import { listBankAccounts } from "@/services/banks.service";
import { toPlainNumber } from "@/lib/serialize";
import { toDateInputValue } from "@/lib/formatters/date";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditExpensePage({ params }: PageProps) {
  const { id } = await params;
  const expense = await getExpense(Number(id));
  if (!expense) notFound();

  const [categories, bankAccounts] = await Promise.all([
    listExpenseCategories(),
    listBankAccounts(),
  ]);

  const defaultValues = {
    categoryId: expense.category.Name,
    description: expense.Description,
    amount: toPlainNumber(expense.Amount) ?? 0,
    expenseDate: toDateInputValue(expense.ExpenseDate),
    supplier: expense.Supplier ?? "",
    reference: expense.Reference ?? "",
    notes: expense.Notes ?? "",
    paymentMethod: expense.PaymentMethod ?? "",
    bankAccountId: expense.BankAccountId ?? null,
  };

  return (
    <>
      <PageHeader
        title={`Editar gasto GAS-${String(expense.ExpenseNumber).padStart(4, "0")}`}
        subtitle="Modifica los datos del gasto"
      />
      <ExpenseForm
        mode="edit"
        expenseId={expense.Id}
        defaultValues={defaultValues}
        categories={categories.map((c) => ({
          Id: c.Id,
          Name: c.Name,
          Color: c.Color,
        }))}
        bankAccounts={bankAccounts.map((b) => ({
          Id: b.Id,
          AccountName: b.AccountName,
          BankName: b.BankName,
        }))}
      />
    </>
  );
}
