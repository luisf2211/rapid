/*
  Rapid — Número de póliza en cotización de aseguradora
  Ejecutar si ya tienes la tabla Quotation (después de 003 o 005).
*/

USE Rapid;

IF COL_LENGTH('dbo.Quotation', 'PolicyNumber') IS NULL
BEGIN
    ALTER TABLE dbo.Quotation
        ADD PolicyNumber NVARCHAR(80) NULL;
END
