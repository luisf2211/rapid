USE Rapid;

IF OBJECT_ID(N'dbo.InventoryMovement', N'U') IS NOT NULL
    DROP TABLE dbo.InventoryMovement;

IF OBJECT_ID(N'dbo.InventoryPart', N'U') IS NOT NULL
    DROP TABLE dbo.InventoryPart;

CREATE TABLE dbo.InventoryPart (
    Id                  INT IDENTITY(1,1) NOT NULL,
    Sku                 NVARCHAR(50) NOT NULL,
    Name                NVARCHAR(150) NOT NULL,
    Description         NVARCHAR(250) NULL,
    Category            NVARCHAR(80) NULL,
    Unit                NVARCHAR(20) NOT NULL
        CONSTRAINT DF_InventoryPart_Unit DEFAULT (N'PZ'),

    QuantityOnHand      DECIMAL(18,2) NOT NULL
        CONSTRAINT DF_InventoryPart_Qty DEFAULT (0),

    ReservedQuantity    DECIMAL(18,2) NOT NULL
        CONSTRAINT DF_InventoryPart_ReservedQty DEFAULT (0),

    MinQuantity         DECIMAL(18,2) NULL,

    UnitCost            DECIMAL(18,2) NULL,

    Location            NVARCHAR(80) NULL,

    IsActive            BIT NOT NULL
        CONSTRAINT DF_InventoryPart_IsActive DEFAULT (1),

    CreatedAt           DATETIME2 NOT NULL
        CONSTRAINT DF_InventoryPart_CreatedAt DEFAULT (SYSDATETIME()),

    CreatedBy           NVARCHAR(150) NULL,

    UpdatedAt           DATETIME2 NULL,

    UpdatedBy           NVARCHAR(150) NULL,

    CONSTRAINT PK_InventoryPart
        PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT CK_InventoryPart_QtyNonNegative
        CHECK (QuantityOnHand >= 0),

    CONSTRAINT CK_InventoryPart_ReservedQtyNonNegative
        CHECK (ReservedQuantity >= 0),

    CONSTRAINT CK_InventoryPart_UnitCost
        CHECK (UnitCost IS NULL OR UnitCost >= 0)
);

CREATE UNIQUE NONCLUSTERED INDEX UX_InventoryPart_Sku
ON dbo.InventoryPart (Sku);

CREATE NONCLUSTERED INDEX IX_InventoryPart_Name
ON dbo.InventoryPart (Name);

CREATE TABLE dbo.InventoryMovement (
    Id                      INT IDENTITY(1,1) NOT NULL,

    InventoryPartId         INT NOT NULL,

    MovementType            NVARCHAR(20) NOT NULL,

    Quantity                DECIMAL(18,2) NOT NULL,

    QuantityBefore          DECIMAL(18,2) NULL,

    QuantityAfter           DECIMAL(18,2) NULL,

    UnitCostAtMovement      DECIMAL(18,2) NULL,

    Reason                  NVARCHAR(50) NULL,

    WorkOrderId             INT NULL,

    Notes                   NVARCHAR(250) NULL,

    CreatedBy               NVARCHAR(150) NULL,

    CreatedAt               DATETIME2 NOT NULL
        CONSTRAINT DF_InventoryMovement_CreatedAt DEFAULT (SYSDATETIME()),

    CONSTRAINT PK_InventoryMovement
        PRIMARY KEY CLUSTERED (Id),

    CONSTRAINT FK_InventoryMovement_Part
        FOREIGN KEY (InventoryPartId)
        REFERENCES dbo.InventoryPart (Id),

    CONSTRAINT FK_InventoryMovement_WorkOrder
        FOREIGN KEY (WorkOrderId)
        REFERENCES dbo.WorkOrder (Id),

    CONSTRAINT CK_InventoryMovement_Type
        CHECK (MovementType IN (N'IN', N'OUT', N'ADJUST')),

    CONSTRAINT CK_InventoryMovement_QtyPositive
        CHECK (Quantity > 0),

    CONSTRAINT CK_InventoryMovement_CostNonNegative
        CHECK (
            UnitCostAtMovement IS NULL
            OR UnitCostAtMovement >= 0
        )
);

CREATE NONCLUSTERED INDEX IX_InventoryMovement_PartId
ON dbo.InventoryMovement (InventoryPartId, CreatedAt DESC);

CREATE NONCLUSTERED INDEX IX_InventoryMovement_WorkOrderId
ON dbo.InventoryMovement (WorkOrderId);

PRINT 'Tablas InventoryPart e InventoryMovement creadas correctamente.';
