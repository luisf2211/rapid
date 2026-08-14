-- Migration: add_quotation_task_types
-- Catálogo parametrizable de tareas de mano de obra para cotizaciones.

CREATE TABLE IF NOT EXISTS "QuotationTaskType" (
  "Id"        SERIAL,
  "CompanyId" INTEGER NOT NULL DEFAULT 1,
  "Name"      VARCHAR(50) NOT NULL,
  "IsActive"  BOOLEAN NOT NULL DEFAULT TRUE,
  "CreatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "UpdatedAt" TIMESTAMPTZ,
  CONSTRAINT "PK_QuotationTaskType" PRIMARY KEY ("Id"),
  CONSTRAINT "FK_QuotationTaskType_Company" FOREIGN KEY ("CompanyId")
    REFERENCES "Company"("Id") ON UPDATE NO ACTION,
  CONSTRAINT "UQ_QuotationTaskType_Company_Name" UNIQUE ("CompanyId", "Name")
);

CREATE INDEX IF NOT EXISTS "IX_QuotationTaskType_Company"
  ON "QuotationTaskType" ("CompanyId", "IsActive");
