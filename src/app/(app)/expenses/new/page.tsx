import { PageHeader } from "@/components/ui/PageHeader";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { listExpenseCategories } from "@/services/expenses.service";
import { listBankAccounts } from "@/services/banks.service";
import { toDateInputValue } from "@/lib/formatters/date";

export default async function NewExpensePage() {
  const [categories, bankAccounts] = await Promise.all([
    listExpenseCategories(),
    listBankAccounts(),
  ]);

  const defaultValues = {
    categoryId: "",
    description: "",
    amount: 0,
    expenseDate: toDateInputValue(new Date()),
    supplier: "",
    reference: "",
    notes: "",
    paymentMethod: "",
    bankAccountId: null as number | null,
  };

  return (
    <>
      <PageHeader
        title="Nuevo gasto"
        subtitle="Registra un gasto operativo del taller"
      />
      <ExpenseForm
        mode="create"
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
