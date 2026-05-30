/*
  Rapid — Módulo de Cotización
  Flujo: Cotización → (aprobada) → Recepción (WorkOrder)

  Ejecutar después de 002-workshop-extend-existing-tables.sql
*/

USE Rapid;

IF OBJECT_ID(N'dbo.QuotationPhoto', N'U') IS NOT NULL DROP TABLE dbo.QuotationPhoto;
IF OBJECT_ID(N'dbo.QuotationDamage', N'U') IS NOT NULL DROP TABLE dbo.QuotationDamage;
IF OBJECT_ID(N'dbo.QuotationPartLine', N'U') IS NOT NULL DROP TABLE dbo.QuotationPartLine;
IF OBJECT_ID(N'dbo.QuotationMaterialLine', N'U') IS NOT NULL DROP TABLE dbo.QuotationMaterialLine;
IF OBJECT_ID(N'dbo.QuotationLaborLine', N'U') IS NOT NULL DROP TABLE dbo.QuotationLaborLine;
IF OBJECT_ID(N'dbo.Quotation', N'U') IS NOT NULL DROP TABLE dbo.Quotation;

CREATE TABLE dbo.Quotation (
    Id                  INT IDENTITY(1,1) NOT NULL,
    QuotationNumber     INT NOT NULL,
    QuotationDate       DATE NOT NULL
        CONSTRAINT DF_Quotation_Date DEFAULT (CAST(SYSDATETIME() AS DATE)),
    ValidUntil          DATE NULL,
    QuotationType       NVARCHAR(20) NOT NULL
        CONSTRAINT DF_Quotation_Type DEFAULT (N'PRIVATE'),
    -- PRIVATE | INSURANCE
    Status              NVARCHAR(30) NOT NULL
        CONSTRAINT DF_Quotation_Status DEFAULT (N'DRAFT'),
    -- DRAFT | PENDING | APPROVED | REJECTED | CONVERTED

    -- Cliente
    CustomerName        NVARCHAR(150) NOT NULL,
    Phone               NVARCHAR(50) NULL,
    Email               NVARCHAR(150) NULL,
    NationalId          NVARCHAR(30) NULL,
    Address             NVARCHAR(250) NULL,

    -- Vehículo
    Brand               NVARCHAR(80) NULL,
    Model               NVARCHAR(80) NULL,
    VehicleYear         INT NULL,
    Color               NVARCHAR(50) NULL,
    Plate               NVARCHAR(30) NULL,
    Vin                 NVARCHAR(30) NULL,
    Mileage             NVARCHAR(50) NULL,

    -- Aseguradora (si QuotationType = INSURANCE)
    InsuranceCompany    NVARCHAR(150) NULL,
    PolicyNumber        NVARCHAR(80) NULL,
    ClaimNumber         NVARCHAR(80) NULL,
    AdjusterName        NVARCHAR(150) NULL,
    AdjusterPhone       NVARCHAR(50) NULL,
    DeductibleAmount    DECIMAL(18, 2) NULL,

    -- Totales estimados
    LaborSubtotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_Quotation_Labor DEFAULT (0),
    MaterialSubtotal    DECIMAL(18,2) NOT NULL CONSTRAINT DF_Quotation_Material DEFAULT (0),
    PartsSubtotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_Quotation_Parts DEFAULT (0),
    TaxRate             DECIMAL(5,4) NOT NULL CONSTRAINT DF_Quotation_TaxRate DEFAULT (0.18),
    TaxAmount           DECIMAL(18,2) NOT NULL CONSTRAINT DF_Quotation_Tax DEFAULT (0),
    DiscountAmount      DECIMAL(18,2) NOT NULL CONSTRAINT DF_Quotation_Discount DEFAULT (0),
    GrandTotal          DECIMAL(18,2) NOT NULL CONSTRAINT DF_Quotation_Total DEFAULT (0),

    -- Condiciones / PDF
    EstimatedDays       INT NULL,
    WarrantyNotes       NVARCHAR(500) NULL,
    TermsNotes          NVARCHAR(MAX) NULL,
    InternalNotes       NVARCHAR(MAX) NULL,

    -- Conversión
    WorkOrderId         INT NULL,
    ApprovedAt          DATETIME2 NULL,
    ApprovedBy          NVARCHAR(150) NULL,
    RejectedAt          DATETIME2 NULL,
    RejectedBy          NVARCHAR(150) NULL,
    RejectionReason     NVARCHAR(500) NULL,
    ConvertedAt         DATETIME2 NULL,
    ConvertedBy         NVARCHAR(150) NULL,

    CreatedAt           DATETIME2 NOT NULL CONSTRAINT DF_Quotation_CreatedAt DEFAULT (SYSDATETIME()),
    CreatedBy           NVARCHAR(150) NULL,
    UpdatedAt           DATETIME2 NULL,
    UpdatedBy           NVARCHAR(150) NULL,

    CONSTRAINT PK_Quotation PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Quotation_Number UNIQUE (QuotationNumber),
    CONSTRAINT CK_Quotation_Type CHECK (QuotationType IN (N'PRIVATE', N'INSURANCE')),
    CONSTRAINT CK_Quotation_Status CHECK (Status IN (
        N'DRAFT', N'PENDING', N'APPROVED', N'REJECTED', N'CONVERTED'
    ))
);

CREATE NONCLUSTERED INDEX IX_Quotation_Status ON dbo.Quotation (Status, QuotationDate DESC);
CREATE NONCLUSTERED INDEX IX_Quotation_Customer ON dbo.Quotation (CustomerName);
CREATE NONCLUSTERED INDEX IX_Quotation_Plate ON dbo.Quotation (Plate);

-- FK WorkOrder después de conversión
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_Quotation_WorkOrder')
BEGIN
    ALTER TABLE dbo.Quotation ADD CONSTRAINT FK_Quotation_WorkOrder
        FOREIGN KEY (WorkOrderId) REFERENCES dbo.WorkOrder (Id);
END

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_WorkOrder_Quotation')
BEGIN
    ALTER TABLE dbo.WorkOrder ADD CONSTRAINT FK_WorkOrder_Quotation
        FOREIGN KEY (QuotationId) REFERENCES dbo.Quotation (Id);
END

-- Mano de obra estimada por área
CREATE TABLE dbo.QuotationLaborLine (
    Id              INT IDENTITY(1,1) NOT NULL,
    QuotationId     INT NOT NULL,
    Area            NVARCHAR(50) NOT NULL,
    -- DESAB | PREP | PAINT | POLISH | ASSEMBLY
    Description     NVARCHAR(250) NULL,
    EstimatedHours  DECIMAL(8,2) NULL,
    HourlyRate      DECIMAL(18,2) NULL,
    LineTotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationLabor_Total DEFAULT (0),
    SortOrder       INT NOT NULL CONSTRAINT DF_QuotationLabor_Sort DEFAULT (0),

    CONSTRAINT PK_QuotationLaborLine PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_QuotationLaborLine_Quotation FOREIGN KEY (QuotationId)
        REFERENCES dbo.Quotation (Id) ON DELETE CASCADE
);

-- Materiales estimados
CREATE TABLE dbo.QuotationMaterialLine (
    Id              INT IDENTITY(1,1) NOT NULL,
    QuotationId     INT NOT NULL,
    InventoryPartId INT NULL,
    ProductName     NVARCHAR(150) NOT NULL,
    Quantity        DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationMaterial_Qty DEFAULT (1),
    Unit            NVARCHAR(20) NULL,
    UnitPrice       DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationMaterial_Price DEFAULT (0),
    LineTotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationMaterial_Total DEFAULT (0),
    SortOrder       INT NOT NULL CONSTRAINT DF_QuotationMaterial_Sort DEFAULT (0),

    CONSTRAINT PK_QuotationMaterialLine PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_QuotationMaterialLine_Quotation FOREIGN KEY (QuotationId)
        REFERENCES dbo.Quotation (Id) ON DELETE CASCADE
);

IF OBJECT_ID(N'dbo.InventoryPart', N'U') IS NOT NULL
BEGIN
    ALTER TABLE dbo.QuotationMaterialLine ADD CONSTRAINT FK_QuotationMaterialLine_Part
        FOREIGN KEY (InventoryPartId) REFERENCES dbo.InventoryPart (Id);
END

-- Repuestos estimados
CREATE TABLE dbo.QuotationPartLine (
    Id              INT IDENTITY(1,1) NOT NULL,
    QuotationId     INT NOT NULL,
    PartName        NVARCHAR(150) NOT NULL,
    Description     NVARCHAR(250) NULL,
    Quantity        DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationPart_Qty DEFAULT (1),
    UnitPrice       DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationPart_Price DEFAULT (0),
    LineTotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_QuotationPart_Total DEFAULT (0),
    SortOrder       INT NOT NULL CONSTRAINT DF_QuotationPart_Sort DEFAULT (0),

    CONSTRAINT PK_QuotationPartLine PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_QuotationPartLine_Quotation FOREIGN KEY (QuotationId)
        REFERENCES dbo.Quotation (Id) ON DELETE CASCADE
);

-- Inspección de daños
CREATE TABLE dbo.QuotationDamage (
    Id              INT IDENTITY(1,1) NOT NULL,
    QuotationId     INT NOT NULL,
    PartName        NVARCHAR(150) NULL,
    VehicleSide     NVARCHAR(30) NULL,
    DamageType      NVARCHAR(50) NULL,
    Description     NVARCHAR(500) NULL,
    PositionX       DECIMAL(10,4) NULL,
    PositionY       DECIMAL(10,4) NULL,

    CONSTRAINT PK_QuotationDamage PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_QuotationDamage_Quotation FOREIGN KEY (QuotationId)
        REFERENCES dbo.Quotation (Id) ON DELETE CASCADE
);

-- Fotografías de cotización
CREATE TABLE dbo.QuotationPhoto (
    Id              INT IDENTITY(1,1) NOT NULL,
    QuotationId     INT NOT NULL,
    PhotoUrl        NVARCHAR(500) NOT NULL,
    Category        NVARCHAR(50) NULL,
    -- INSPECTION | BEFORE | DURING | AFTER
    Description     NVARCHAR(250) NULL,
    CreatedAt       DATETIME2 NOT NULL CONSTRAINT DF_QuotationPhoto_Created DEFAULT (SYSDATETIME()),
    CreatedBy       NVARCHAR(150) NULL,

    CONSTRAINT PK_QuotationPhoto PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_QuotationPhoto_Quotation FOREIGN KEY (QuotationId)
        REFERENCES dbo.Quotation (Id) ON DELETE CASCADE
);

PRINT 'Tablas de Cotización creadas correctamente.';
