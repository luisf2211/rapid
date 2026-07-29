import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { listExpenseCategories } from "@/services/expenses.service";
import { ExpenseCategoriesManager } from "@/components/expenses/ExpenseCategoriesManager";

export const dynamic = "force-dynamic";

export default async function ExpenseCategoriesPage() {
  const categories = await listExpenseCategories();

  return (
    <>
      <PageHeader
        title="Categorías de gastos"
        subtitle="Administra las categorías para clasificar los gastos del taller."
        actions={
          <Link href="/expenses" className="btn-secondary">
            <ArrowLeft className="w-4 h-4" />
            Volver a gastos
          </Link>
        }
      />
      <ExpenseCategoriesManager
        categories={categories.map((c) => ({
          id: c.Id,
          name: c.Name,
          color: c.Color ?? "#6b7280",
        }))}
      />
    </>
  );
}
