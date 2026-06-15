/*
  Rapid — Sello digital del taller (cotización y factura impresa)
  Ejecutar después de 004-workshop-invoice-audit-settings.sql
*/

USE Rapid;

IF COL_LENGTH('dbo.WorkshopSettings', 'StampUrl') IS NULL
BEGIN
    ALTER TABLE dbo.WorkshopSettings ADD StampUrl NVARCHAR(500) NULL;
END

PRINT 'WorkshopSettings.StampUrl listo.';
