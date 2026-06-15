/*
  Autenticación multi-empresa: Company, User y CompanyId en tablas principales.
  Ejecutar en base Rapid, luego: npx prisma db pull && npx prisma generate
*/

IF OBJECT_ID(N'dbo.Company', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.Company (
        Id          INT IDENTITY(1,1) NOT NULL,
        Name        NVARCHAR(150) NOT NULL,
        Slug        NVARCHAR(80) NOT NULL,
        IsActive    BIT NOT NULL CONSTRAINT DF_Company_IsActive DEFAULT (1),
        CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_Company_CreatedAt DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_Company PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT UQ_Company_Slug UNIQUE (Slug)
    );
END

IF OBJECT_ID(N'dbo.[User]', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.[User] (
        Id            INT IDENTITY(1,1) NOT NULL,
        Email         NVARCHAR(150) NOT NULL,
        PasswordHash  NVARCHAR(255) NOT NULL,
        FullName      NVARCHAR(150) NULL,
        Role          NVARCHAR(30) NOT NULL,
        CompanyId     INT NULL,
        IsActive      BIT NOT NULL CONSTRAINT DF_User_IsActive DEFAULT (1),
        CreatedAt     DATETIME2 NOT NULL CONSTRAINT DF_User_CreatedAt DEFAULT (SYSUTCDATETIME()),
        LastLoginAt   DATETIME2 NULL,
        CONSTRAINT PK_User PRIMARY KEY CLUSTERED (Id),
        CONSTRAINT UQ_User_Email UNIQUE (Email),
        CONSTRAINT FK_User_Company FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id)
    );
END

IF NOT EXISTS (SELECT 1 FROM dbo.Company)
BEGIN
    INSERT INTO dbo.Company (Name, Slug, IsActive)
    VALUES (N'Taller principal', N'taller-principal', 1);
END

DECLARE @DefaultCompanyId INT = (SELECT TOP 1 Id FROM dbo.Company ORDER BY Id);

IF COL_LENGTH('dbo.WorkOrder', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder
        ADD CompanyId INT NOT NULL
            CONSTRAINT DF_WorkOrder_CompanyId DEFAULT (1);
END

IF COL_LENGTH('dbo.InventoryPart', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.InventoryPart
        ADD CompanyId INT NOT NULL
            CONSTRAINT DF_InventoryPart_CompanyId DEFAULT (1);
END

IF COL_LENGTH('dbo.Quotation', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.Quotation
        ADD CompanyId INT NOT NULL
            CONSTRAINT DF_Quotation_CompanyId DEFAULT (1);
END

IF COL_LENGTH('dbo.Invoice', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.Invoice
        ADD CompanyId INT NOT NULL
            CONSTRAINT DF_Invoice_CompanyId DEFAULT (1);
END

IF COL_LENGTH('dbo.Employee', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.Employee
        ADD CompanyId INT NOT NULL
            CONSTRAINT DF_Employee_CompanyId DEFAULT (1);
END

IF COL_LENGTH('dbo.PayrollPeriod', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.PayrollPeriod
        ADD CompanyId INT NOT NULL
            CONSTRAINT DF_PayrollPeriod_CompanyId DEFAULT (1);
END

IF COL_LENGTH('dbo.WorkshopSettings', 'CompanyId') IS NULL
BEGIN
    ALTER TABLE dbo.WorkshopSettings
        ADD CompanyId INT NULL;
END

UPDATE dbo.WorkOrder SET CompanyId = @DefaultCompanyId WHERE CompanyId IS NULL OR CompanyId = 0;
UPDATE dbo.InventoryPart SET CompanyId = @DefaultCompanyId WHERE CompanyId IS NULL OR CompanyId = 0;
UPDATE dbo.Quotation SET CompanyId = @DefaultCompanyId WHERE CompanyId IS NULL OR CompanyId = 0;
UPDATE dbo.Invoice SET CompanyId = @DefaultCompanyId WHERE CompanyId IS NULL OR CompanyId = 0;
UPDATE dbo.Employee SET CompanyId = @DefaultCompanyId WHERE CompanyId IS NULL OR CompanyId = 0;
UPDATE dbo.PayrollPeriod SET CompanyId = @DefaultCompanyId WHERE CompanyId IS NULL OR CompanyId = 0;

UPDATE dbo.WorkshopSettings
SET CompanyId = @DefaultCompanyId
WHERE CompanyId IS NULL;

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_WorkOrder_Company')
BEGIN
    ALTER TABLE dbo.WorkOrder
        ADD CONSTRAINT FK_WorkOrder_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_InventoryPart_Company')
BEGIN
    ALTER TABLE dbo.InventoryPart
        ADD CONSTRAINT FK_InventoryPart_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Quotation_Company')
BEGIN
    ALTER TABLE dbo.Quotation
        ADD CONSTRAINT FK_Quotation_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Invoice_Company')
BEGIN
    ALTER TABLE dbo.Invoice
        ADD CONSTRAINT FK_Invoice_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Employee_Company')
BEGIN
    ALTER TABLE dbo.Employee
        ADD CONSTRAINT FK_Employee_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_PayrollPeriod_Company')
BEGIN
    ALTER TABLE dbo.PayrollPeriod
        ADD CONSTRAINT FK_PayrollPeriod_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_WorkshopSettings_Company')
BEGIN
    ALTER TABLE dbo.WorkshopSettings
        ADD CONSTRAINT FK_WorkshopSettings_Company
        FOREIGN KEY (CompanyId) REFERENCES dbo.Company (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_WorkOrder_CompanyId')
BEGIN
    CREATE INDEX IX_WorkOrder_CompanyId ON dbo.WorkOrder (CompanyId);
END

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_InventoryPart_CompanyId')
BEGIN
    CREATE INDEX IX_InventoryPart_CompanyId ON dbo.InventoryPart (CompanyId, IsActive);
END

IF NOT EXISTS (SELECT 1 FROM dbo.[User] WHERE Email = N'admin@rapid.local')
BEGIN
    INSERT INTO dbo.[User] (Email, PasswordHash, FullName, Role, CompanyId, IsActive)
    VALUES (
        N'admin@rapid.local',
        N'$2b$10$Fe9SJzY9W3139Vy9yTmpgexowwcqhMvfdnrZL4kGGfWRJ34JVVk0i',
        N'Administrador plataforma',
        N'PLATFORM_ADMIN',
        NULL,
        1
    );
END
