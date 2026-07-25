/*
  Agrega la columna MileageUnit a WorkOrder para registrar si el odómetro se
  tomó en millas ("mi") o kilómetros ("km").

  Base activa: PostgreSQL (Supabase). Aplicar con:
    pnpm prisma db execute --file scripts/sql/020-add-workorder-mileage-unit.sql --schema prisma/schema.prisma

  NO usar `prisma db push` contra la base actual: el schema de Prisma no incluye
  las tablas de gastos/caja chica (BankAccount, BankTransaction, Expense,
  ExpenseCategory, PettyCashFund, PettyCashTransaction), la columna
  User.Permissions ni el índice UX_InventoryPart_Sku, así que un push las
  eliminaría.

  La columna es nullable: las órdenes existentes quedan sin unidad y se siguen
  mostrando con el texto libre que tengan en Mileage.
*/

ALTER TABLE "WorkOrder"
  ADD COLUMN IF NOT EXISTS "MileageUnit" VARCHAR(5) NULL;
