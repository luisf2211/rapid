/*
  Mano de obra simplificada:
  - LaborOrder.Technician (empleado / externo) — ya existe si corriste 002
  - LaborOrderItem.Quantity (cantidad por línea)
*/
IF COL_LENGTH('dbo.LaborOrder', 'Technician') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD Technician NVARCHAR(150) NULL;
END

IF COL_LENGTH('dbo.LaborOrderItem', 'Quantity') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrderItem ADD Quantity DECIMAL(18, 2) NULL;
END

UPDATE dbo.LaborOrderItem
SET Quantity = 1
WHERE Quantity IS NULL;

PRINT 'Mano de obra: columnas Technician y Quantity listas.';
