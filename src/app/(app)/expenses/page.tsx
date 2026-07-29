import Link from "next/link";
import { Plus, Search, TrendingDown, Tag } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listExpenses, listExpenseCategories } from "@/services/expenses.service";
import { ExpensesTable } from "@/components/expenses/ExpensesTable";
import { toPlainNumber } from "@/lib/serialize";
import { formatDate } from "@/lib/formatters/date";
import { formatMoney } from "@/lib/formatters/money";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ q?: string; category?: string; from?: string; to?: string }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const { q, category, from, to } = await searchParams;

  let expenses: Awaited<ReturnType<typeof listExpenses>> = [];
  let categories: Awaited<ReturnType<typeof listExpenseCategories>> = [];
  let error: string | null = null;

  try {
    [expenses, categories] = await Promise.all([
      listExpenses({
        search: q,
        categoryId: category ? Number(category) : undefined,
        from,
        to,
      }),
      listExpenseCategories(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Error desconocido";
  }

  const totalAmount = expenses.reduce(
    (sum, exp) => sum + (toPlainNumber(exp.Amount) ?? 0),
    0,
  );

  const tableItems = expenses.map((item) => ({
    id: item.Id,
    expenseNumber: item.ExpenseNumber,
    description: item.Description,
    amount: toPlainNumber(item.Amount) ?? 0,
    expenseDateLabel: formatDate(item.ExpenseDate),
    categoryName: item.category.Name,
    categoryColor: item.category.Color ?? "#6b7280",
    supplier: item.Supplier,
    paymentMethod: item.PaymentMethod,
  }));

  return (
    <>
      <PageHeader
        title="Gastos"
        subtitle="Registra y controla todos los gastos operativos del taller."
        actions={
          <div className="flex gap-2">
            <Link href="/expenses/categories" className="btn-secondary">
              <Tag className="w-4 h-4" />
              Categorías
            </Link>
            <Link href="/expenses/new" className="btn-primary">
              <Plus className="w-4 h-4" />
              Nuevo gasto
            </Link>
          </div>
        }
      />

      {totalAmount > 0 && (
        <div className="card p-4 mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-xs text-rapid-text-muted">Total del período</p>
            <p className="text-xl font-bold tabular-nums text-red-600">
              {formatMoney(totalAmount)}
            </p>
          </div>
          <p className="ml-auto text-sm text-rapid-text-muted">
            {expenses.length} gasto{expenses.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <form
        method="get"
        className="card p-3 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center"
      >
        <div className="relative sm:col-span-2 lg:col-span-1 min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rapid-text-muted"
            aria-hidden
          />
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Descripción, proveedor..."
            className="form-input w-full pl-10"
          />
        </div>
        <select
          name="category"
          defaultValue={category ?? ""}
          className="form-input w-full"
        >
          <option value="">Todas las categorías</option>
          {categories.map((cat) => (
            <option key={cat.Id} value={cat.Id}>
              {cat.Name}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from ?? ""}
          className="form-input w-full"
          placeholder="Desde"
        />
        <input
          type="date"
          name="to"
          defaultValue={to ?? ""}
          className="form-input w-full"
          placeholder="Hasta"
        />
        <button type="submit" className="btn-dark w-full lg:w-auto lg:px-5">
          Buscar
        </button>
      </form>

      {error && (
        <div className="card border-amber-200 bg-amber-50 p-4 mb-4 text-sm text-amber-800">
          No se pudo cargar el listado: {error}
        </div>
      )}

      {!error && expenses.length === 0 && (
        <div className="card p-12 text-center">
          <TrendingDown className="w-10 h-10 mx-auto text-rapid-text-muted/50 mb-3" />
          <p className="font-medium text-rapid-text">No hay gastos registrados</p>
          <p className="text-sm text-rapid-text-muted mt-1">
            Registra comida, tornillos, facturas misceláneas y más.
          </p>
          <Link href="/expenses/new" className="btn-primary inline-flex mt-4">
            <Plus className="w-4 h-4" />
            Registrar primer gasto
          </Link>
        </div>
      )}

      {!error && expenses.length > 0 && <ExpensesTable items={tableItems} />}
    </>
  );
}
