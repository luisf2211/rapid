/*
  Rapid — Facturación, auditoría y configuración del taller
  Ejecutar después de 003-workshop-quotation-tables.sql
*/

USE Rapid;

IF OBJECT_ID(N'dbo.InvoiceLine', N'U') IS NOT NULL DROP TABLE dbo.InvoiceLine;
IF OBJECT_ID(N'dbo.Invoice', N'U') IS NOT NULL DROP TABLE dbo.Invoice;
IF OBJECT_ID(N'dbo.AuditLog', N'U') IS NOT NULL DROP TABLE dbo.AuditLog;
IF OBJECT_ID(N'dbo.WorkshopSettings', N'U') IS NOT NULL DROP TABLE dbo.WorkshopSettings;

-- Configuración única del taller (logo, ITBIS, datos para PDF)
CREATE TABLE dbo.WorkshopSettings (
    Id                  INT NOT NULL CONSTRAINT DF_WorkshopSettings_Id DEFAULT (1),
    BusinessName        NVARCHAR(150) NOT NULL,
    LegalName           NVARCHAR(200) NULL,
    Rnc                 NVARCHAR(30) NULL,
    Phone               NVARCHAR(50) NULL,
    Email               NVARCHAR(150) NULL,
    Address             NVARCHAR(250) NULL,
    LogoUrl             NVARCHAR(500) NULL,
    DefaultTaxRate      DECIMAL(5,4) NOT NULL CONSTRAINT DF_WorkshopSettings_Tax DEFAULT (0.18),
    QuotationFooter     NVARCHAR(MAX) NULL,
    InvoiceFooter       NVARCHAR(MAX) NULL,
    UpdatedAt           DATETIME2 NULL,
    UpdatedBy           NVARCHAR(150) NULL,

    CONSTRAINT PK_WorkshopSettings PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT CK_WorkshopSettings_SingleRow CHECK (Id = 1)
);

IF NOT EXISTS (SELECT 1 FROM dbo.WorkshopSettings WHERE Id = 1)
BEGIN
    INSERT INTO dbo.WorkshopSettings (Id, BusinessName, DefaultTaxRate)
    VALUES (1, N'Rapid Taller', 0.18);
END

-- Factura (basada en costos reales de la recepción)
CREATE TABLE dbo.Invoice (
    Id                  INT IDENTITY(1,1) NOT NULL,
    InvoiceNumber       INT NOT NULL,
    InvoiceDate         DATE NOT NULL
        CONSTRAINT DF_Invoice_Date DEFAULT (CAST(SYSDATETIME() AS DATE)),
    WorkOrderId         INT NOT NULL,
    QuotationId         INT NULL,

    -- Cliente / vehículo (snapshot al facturar)
    CustomerName        NVARCHAR(150) NOT NULL,
    NationalId          NVARCHAR(30) NULL,
    Phone               NVARCHAR(50) NULL,
    Email               NVARCHAR(150) NULL,
    Address             NVARCHAR(250) NULL,
    Brand               NVARCHAR(80) NULL,
    Model               NVARCHAR(80) NULL,
    VehicleYear         INT NULL,
    Plate               NVARCHAR(30) NULL,
    Vin                 NVARCHAR(30) NULL,

    BillingType         NVARCHAR(20) NOT NULL
        CONSTRAINT DF_Invoice_BillingType DEFAULT (N'PRIVATE'),
    -- PRIVATE | INSURANCE

    Status              NVARCHAR(30) NOT NULL
        CONSTRAINT DF_Invoice_Status DEFAULT (N'PENDING'),
    -- PENDING | INVOICED | PAID | VOID

    LaborSubtotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Labor DEFAULT (0),
    MaterialSubtotal    DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Material DEFAULT (0),
    PartsSubtotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Parts DEFAULT (0),
    Subtotal            DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Subtotal DEFAULT (0),
    DiscountAmount      DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Discount DEFAULT (0),
    TaxRate             DECIMAL(5,4) NOT NULL CONSTRAINT DF_Invoice_TaxRate DEFAULT (0.18),
    TaxAmount           DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Tax DEFAULT (0),
    GrandTotal          DECIMAL(18,2) NOT NULL CONSTRAINT DF_Invoice_Total DEFAULT (0),

    PaidAt              DATETIME2 NULL,
    PaidBy              NVARCHAR(150) NULL,
    PaymentReference    NVARCHAR(100) NULL,
    VoidedAt            DATETIME2 NULL,
    VoidedBy            NVARCHAR(150) NULL,
    VoidReason          NVARCHAR(500) NULL,
    Notes               NVARCHAR(MAX) NULL,

    CreatedAt           DATETIME2 NOT NULL CONSTRAINT DF_Invoice_CreatedAt DEFAULT (SYSDATETIME()),
    CreatedBy           NVARCHAR(150) NULL,
    UpdatedAt           DATETIME2 NULL,
    UpdatedBy           NVARCHAR(150) NULL,

    CONSTRAINT PK_Invoice PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT UQ_Invoice_Number UNIQUE (InvoiceNumber),
    CONSTRAINT FK_Invoice_WorkOrder FOREIGN KEY (WorkOrderId) REFERENCES dbo.WorkOrder (Id),
    CONSTRAINT FK_Invoice_Quotation FOREIGN KEY (QuotationId) REFERENCES dbo.Quotation (Id),
    CONSTRAINT CK_Invoice_Status CHECK (Status IN (N'PENDING', N'INVOICED', N'PAID', N'VOID')),
    CONSTRAINT CK_Invoice_BillingType CHECK (BillingType IN (N'PRIVATE', N'INSURANCE'))
);

CREATE UNIQUE NONCLUSTERED INDEX UX_Invoice_WorkOrder_Active
    ON dbo.Invoice (WorkOrderId)
    WHERE Status <> N'VOID';

CREATE NONCLUSTERED INDEX IX_Invoice_Status ON dbo.Invoice (Status, InvoiceDate DESC);

-- Líneas de factura (desglose trazable)
CREATE TABLE dbo.InvoiceLine (
    Id              INT IDENTITY(1,1) NOT NULL,
    InvoiceId       INT NOT NULL,
    LineType        NVARCHAR(20) NOT NULL,
    -- LABOR | MATERIAL | PART | OTHER
    SourceType      NVARCHAR(30) NULL,
    -- LABOR_ORDER | MATERIAL_REQUISITION | MANUAL
    SourceId        INT NULL,
    Description     NVARCHAR(250) NOT NULL,
    Quantity        DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceLine_Qty DEFAULT (1),
    UnitPrice       DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceLine_Price DEFAULT (0),
    LineTotal       DECIMAL(18,2) NOT NULL CONSTRAINT DF_InvoiceLine_Total DEFAULT (0),
    SortOrder       INT NOT NULL CONSTRAINT DF_InvoiceLine_Sort DEFAULT (0),

    CONSTRAINT PK_InvoiceLine PRIMARY KEY CLUSTERED (Id),
    CONSTRAINT FK_InvoiceLine_Invoice FOREIGN KEY (InvoiceId)
        REFERENCES dbo.Invoice (Id) ON DELETE CASCADE,
    CONSTRAINT CK_InvoiceLine_Type CHECK (LineType IN (
        N'LABOR', N'MATERIAL', N'PART', N'OTHER'
    ))
);

-- Auditoría transversal
CREATE TABLE dbo.AuditLog (
    Id              BIGINT IDENTITY(1,1) NOT NULL,
    OccurredAt      DATETIME2 NOT NULL CONSTRAINT DF_AuditLog_Occurred DEFAULT (SYSDATETIME()),
    UserName        NVARCHAR(150) NULL,
    Action          NVARCHAR(50) NOT NULL,
    -- CREATED | UPDATED | APPROVED | REJECTED | CONVERTED | DELIVERED | INVOICED | PAID | VOID | STOCK_OUT ...
    EntityType      NVARCHAR(50) NOT NULL,
    -- QUOTATION | WORK_ORDER | LABOR_ORDER | MATERIAL_REQUISITION | INVOICE | INVENTORY ...
    EntityId        INT NULL,
    EntityLabel     NVARCHAR(200) NULL,
    WorkOrderId     INT NULL,
    QuotationId     INT NULL,
    Details         NVARCHAR(MAX) NULL,
    IpAddress       NVARCHAR(45) NULL,

    CONSTRAINT PK_AuditLog PRIMARY KEY CLUSTERED (Id)
);

CREATE NONCLUSTERED INDEX IX_AuditLog_Entity
    ON dbo.AuditLog (EntityType, EntityId, OccurredAt DESC);

CREATE NONCLUSTERED INDEX IX_AuditLog_WorkOrder
    ON dbo.AuditLog (WorkOrderId, OccurredAt DESC);

CREATE NONCLUSTERED INDEX IX_AuditLog_Occurred
    ON dbo.AuditLog (OccurredAt DESC);

-- FK requisición en movimiento de inventario
IF COL_LENGTH('dbo.InventoryMovement', 'MaterialRequisitionId') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_InventoryMovement_Requisition')
BEGIN
    ALTER TABLE dbo.InventoryMovement ADD CONSTRAINT FK_InventoryMovement_Requisition
        FOREIGN KEY (MaterialRequisitionId) REFERENCES dbo.MaterialRequisition (Id);
END

PRINT 'Facturación, auditoría y configuración creadas correctamente.';
