/*
  Rapid — Deducible en cotización de aseguradora
  Ejecutar en bases que ya tienen 003-workshop-quotation-tables.sql
*/

USE Rapid;

IF COL_LENGTH('dbo.Quotation', 'DeductibleAmount') IS NULL
BEGIN
    ALTER TABLE dbo.Quotation
        ADD DeductibleAmount DECIMAL(18, 2) NULL;
END
