/*
  Mensaje de forma de pago para cotizaciones (configuración del taller).
  Ejecutar en base Rapid, luego: npx prisma generate
*/

IF COL_LENGTH('dbo.WorkshopSettings', 'QuotationPaymentNotes') IS NULL
BEGIN
    ALTER TABLE dbo.WorkshopSettings
        ADD QuotationPaymentNotes NVARCHAR(MAX) NULL;
END
