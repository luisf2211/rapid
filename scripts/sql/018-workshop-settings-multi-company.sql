/*
  WorkshopSettings: una fila por empresa (ya no Id = 1 único).
  Ejecutar en base Rapid.
*/

IF EXISTS (
    SELECT 1 FROM sys.check_constraints
    WHERE name = N'CK_WorkshopSettings_SingleRow'
)
BEGIN
    ALTER TABLE dbo.WorkshopSettings
        DROP CONSTRAINT CK_WorkshopSettings_SingleRow;
END

IF EXISTS (
    SELECT 1 FROM sys.default_constraints
    WHERE name = N'DF_WorkshopSettings_Id'
)
BEGIN
    ALTER TABLE dbo.WorkshopSettings
        DROP CONSTRAINT DF_WorkshopSettings_Id;
END

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes WHERE name = N'UQ_WorkshopSettings_CompanyId'
)
BEGIN
    CREATE UNIQUE INDEX UQ_WorkshopSettings_CompanyId
        ON dbo.WorkshopSettings (CompanyId)
        WHERE CompanyId IS NOT NULL;
END
