-- Migration: Convert FuelLevel from VarChar to Integer (percentage 0-100)
-- and add MileageUnit to Quotation table.

-- 1. Add temporary integer column
ALTER TABLE "WorkOrderReception" ADD COLUMN IF NOT EXISTS "FuelLevelNew" INTEGER;

-- 2. Migrate existing string values to integers
UPDATE "WorkOrderReception" SET "FuelLevelNew" = CASE
  WHEN "FuelLevel" = 'EMPTY' THEN 0
  WHEN "FuelLevel" = 'QUARTER' THEN 25
  WHEN "FuelLevel" = 'HALF' THEN 50
  WHEN "FuelLevel" = 'THREE_QUARTERS' THEN 75
  WHEN "FuelLevel" = 'FULL' THEN 100
  ELSE 50
END
WHERE "FuelLevel" IS NOT NULL;

-- 3. Drop old column and rename new one
ALTER TABLE "WorkOrderReception" DROP COLUMN "FuelLevel";
ALTER TABLE "WorkOrderReception" RENAME COLUMN "FuelLevelNew" TO "FuelLevel";
ALTER TABLE "WorkOrderReception" ALTER COLUMN "FuelLevel" SET DEFAULT 50;

-- 4. Add MileageUnit column to Quotation
ALTER TABLE "Quotation" ADD COLUMN IF NOT EXISTS "MileageUnit" VARCHAR(5);
