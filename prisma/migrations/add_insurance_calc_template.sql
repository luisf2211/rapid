-- Migration: add_insurance_calc_template
-- Agrega columna de plantilla de cálculo a las aseguradoras.

ALTER TABLE "InsuranceCompany"
  ADD COLUMN IF NOT EXISTS "CalcTemplate" VARCHAR(50) DEFAULT NULL;
