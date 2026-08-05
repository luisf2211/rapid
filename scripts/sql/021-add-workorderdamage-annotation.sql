/*
  Agrega a WorkOrderDamage las columnas del marcado libre de daños:
  la herramienta de anotación usada (AnnotationTool: crossMark, circle,
  scratch, arrow, crack, text) y el punto final de flechas/rayones
  (PositionX2/PositionY2, en porcentaje 0-100 del lienzo de la vista).

  Base activa: PostgreSQL (Supabase). Aplicar con:
    pnpm prisma db execute --file scripts/sql/021-add-workorderdamage-annotation.sql --schema prisma/schema.prisma

  NO usar `prisma db push` contra la base actual: el schema de Prisma no incluye
  las tablas de gastos/caja chica (BankAccount, BankTransaction, Expense,
  ExpenseCategory, PettyCashFund, PettyCashTransaction), la columna
  User.Permissions ni el índice UX_InventoryPart_Sku, así que un push las
  eliminaría.

  Las tres columnas son nullable y el ALTER es idempotente (IF NOT EXISTS):
  los daños existentes (legacy por ZoneNumber o por coordenadas) no se tocan.
*/

ALTER TABLE "WorkOrderDamage"
  ADD COLUMN IF NOT EXISTS "AnnotationTool" VARCHAR(20) NULL;

ALTER TABLE "WorkOrderDamage"
  ADD COLUMN IF NOT EXISTS "PositionX2" DECIMAL(10,4) NULL;

ALTER TABLE "WorkOrderDamage"
  ADD COLUMN IF NOT EXISTS "PositionY2" DECIMAL(10,4) NULL;
