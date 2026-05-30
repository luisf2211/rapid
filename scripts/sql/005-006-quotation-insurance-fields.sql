/*
  Rapid — Campos de aseguradora en Quotation (deducible + póliza)
  Ejecutar una sola vez si ya tienes 003 y faltan columnas.
*/

USE Rapid;

IF COL_LENGTH('dbo.Quotation', 'DeductibleAmount') IS NULL
BEGIN
    ALTER TABLE dbo.Quotation
        ADD DeductibleAmount DECIMAL(18, 2) NULL;
END

IF COL_LENGTH('dbo.Quotation', 'PolicyNumber') IS NULL
BEGIN
    ALTER TABLE dbo.Quotation
        ADD PolicyNumber NVARCHAR(80) NULL;
END
