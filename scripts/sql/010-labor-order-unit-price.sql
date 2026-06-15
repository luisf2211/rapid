/*
  Mano de obra: precio por pieza y total en $ por línea.
  - LaborOrderItem.UnitPrice — tarifa por pieza del técnico
  - LaborOrderItem.Total — monto línea (cantidad × precio)
  - LaborOrderItem.Quantity — cantidad de piezas
*/
IF COL_LENGTH('dbo.LaborOrderItem', 'UnitPrice') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrderItem ADD UnitPrice DECIMAL(18, 2) NULL;
END

PRINT 'Mano de obra: columna UnitPrice lista.';
