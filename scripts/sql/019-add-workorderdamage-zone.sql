/*
  Agrega la columna ZoneNumber a WorkOrderDamage para el marcado visual de daños
  por zonas numeradas del vehículo en la recepción.

  Base activa: PostgreSQL (Supabase). Alternativamente aplicar con:
    pnpm prisma:push

  La columna es nullable: no afecta los registros existentes (daños legacy sin zona).
*/

ALTER TABLE "WorkOrderDamage"
  ADD COLUMN IF NOT EXISTS "ZoneNumber" INTEGER NULL;
