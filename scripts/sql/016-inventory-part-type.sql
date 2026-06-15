/*
  Separa inventario de materiales vs pintura (PartType).
  Ejecutar en base Rapid, luego: npx prisma generate
*/

IF COL_LENGTH('dbo.InventoryPart', 'PartType') IS NULL
BEGIN
    ALTER TABLE dbo.InventoryPart
        ADD PartType NVARCHAR(20) NOT NULL
            CONSTRAINT DF_InventoryPart_PartType DEFAULT (N'MATERIAL');
END

UPDATE dbo.InventoryPart
SET PartType = N'PAINT'
WHERE PartType = N'MATERIAL'
  AND Category = N'Pintura';

IF NOT EXISTS (
    SELECT 1 FROM sys.check_constraints WHERE name = N'CK_InventoryPart_PartType'
)
BEGIN
    ALTER TABLE dbo.InventoryPart
        ADD CONSTRAINT CK_InventoryPart_PartType
        CHECK (PartType IN (N'MATERIAL', N'PAINT'));
END

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = N'IX_InventoryPart_PartType'
)
BEGIN
    CREATE INDEX IX_InventoryPart_PartType ON dbo.InventoryPart (PartType, IsActive);
END
