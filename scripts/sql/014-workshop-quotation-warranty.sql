/*
  Mensaje de garantía para cotizaciones (configuración del taller).
  Ejecutar en base Rapid, luego: npx prisma generate
*/

IF COL_LENGTH('dbo.WorkshopSettings', 'QuotationWarrantyNotes') IS NULL
BEGIN
    ALTER TABLE dbo.WorkshopSettings
        ADD QuotationWarrantyNotes NVARCHAR(MAX) NULL;
END
