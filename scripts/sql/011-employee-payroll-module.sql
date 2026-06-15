/*
  Módulo empleados + pagos (anticipos y quincena).
  Ejecutar en base Rapid, luego: npx prisma db pull && npx prisma generate
*/

IF OBJECT_ID('dbo.Employee', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Employee (
        Id               INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_Employee PRIMARY KEY,
        Name             NVARCHAR(150) NOT NULL,
        Role             NVARCHAR(80) NOT NULL,
        Phone            NVARCHAR(50) NULL,
        NationalId       NVARCHAR(30) NULL,
        DefaultUnitPrice DECIMAL(18, 2) NULL,
        IsExternal       BIT NOT NULL CONSTRAINT DF_Employee_IsExternal DEFAULT (0),
        IsActive         BIT NOT NULL CONSTRAINT DF_Employee_IsActive DEFAULT (1),
        HiredAt          DATE NULL,
        Notes            NVARCHAR(500) NULL,
        CreatedAt        DATETIME2 NOT NULL CONSTRAINT DF_Employee_CreatedAt DEFAULT (sysdatetime())
    );
END

IF COL_LENGTH('dbo.LaborOrder', 'EmployeeId') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD EmployeeId INT NULL;
END

IF NOT EXISTS (
    SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_LaborOrder_Employee'
)
BEGIN
    ALTER TABLE dbo.LaborOrder
        ADD CONSTRAINT FK_LaborOrder_Employee
        FOREIGN KEY (EmployeeId) REFERENCES dbo.Employee (Id);
END

IF OBJECT_ID('dbo.PayrollPeriod', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PayrollPeriod (
        Id          INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PayrollPeriod PRIMARY KEY,
        PeriodStart DATE NOT NULL,
        PeriodEnd   DATE NOT NULL,
        Status      NVARCHAR(20) NOT NULL CONSTRAINT DF_PayrollPeriod_Status DEFAULT (N'OPEN'),
        ClosedAt    DATETIME2 NULL,
        PaidAt      DATETIME2 NULL,
        Notes       NVARCHAR(500) NULL,
        CreatedAt   DATETIME2 NOT NULL CONSTRAINT DF_PayrollPeriod_CreatedAt DEFAULT (sysdatetime()),
        CONSTRAINT CK_PayrollPeriod_Status CHECK (
            Status IN (N'OPEN', N'CLOSED', N'PAID')
        )
    );
END

IF OBJECT_ID('dbo.PayrollSettlement', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PayrollSettlement (
        Id                 INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PayrollSettlement PRIMARY KEY,
        PayrollPeriodId    INT NOT NULL,
        EmployeeId         INT NOT NULL,
        GrossAmount        DECIMAL(18, 2) NOT NULL CONSTRAINT DF_PayrollSettlement_Gross DEFAULT (0),
        AdvancesAmount     DECIMAL(18, 2) NOT NULL CONSTRAINT DF_PayrollSettlement_Advances DEFAULT (0),
        AdjustmentsAmount  DECIMAL(18, 2) NOT NULL CONSTRAINT DF_PayrollSettlement_Adj DEFAULT (0),
        NetAmount          DECIMAL(18, 2) NOT NULL CONSTRAINT DF_PayrollSettlement_Net DEFAULT (0),
        Status             NVARCHAR(20) NOT NULL CONSTRAINT DF_PayrollSettlement_Status DEFAULT (N'PENDING'),
        CreatedAt          DATETIME2 NOT NULL CONSTRAINT DF_PayrollSettlement_CreatedAt DEFAULT (sysdatetime()),
        CONSTRAINT FK_PayrollSettlement_Period FOREIGN KEY (PayrollPeriodId) REFERENCES dbo.PayrollPeriod (Id),
        CONSTRAINT FK_PayrollSettlement_Employee FOREIGN KEY (EmployeeId) REFERENCES dbo.Employee (Id),
        CONSTRAINT CK_PayrollSettlement_Status CHECK (
            Status IN (N'PENDING', N'PAID')
        ),
        CONSTRAINT UQ_PayrollSettlement_PeriodEmployee UNIQUE (PayrollPeriodId, EmployeeId)
    );
END

IF OBJECT_ID('dbo.PayrollLine', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.PayrollLine (
        Id                   INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_PayrollLine PRIMARY KEY,
        PayrollSettlementId  INT NOT NULL,
        SourceType           NVARCHAR(20) NOT NULL,
        LaborOrderId         INT NULL,
        LaborOrderItemId     INT NULL,
        WorkOrderId          INT NULL,
        Description          NVARCHAR(250) NOT NULL,
        Quantity             DECIMAL(18, 2) NOT NULL,
        UnitPrice            DECIMAL(18, 2) NOT NULL,
        Amount               DECIMAL(18, 2) NOT NULL,
        CONSTRAINT FK_PayrollLine_Settlement FOREIGN KEY (PayrollSettlementId) REFERENCES dbo.PayrollSettlement (Id) ON DELETE CASCADE,
        CONSTRAINT CK_PayrollLine_SourceType CHECK (
            SourceType IN (N'LABOR_ORDER', N'ADJUSTMENT')
        )
    );
END

IF OBJECT_ID('dbo.EmployeePayment', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeePayment (
        Id                      INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmployeePayment PRIMARY KEY,
        PaymentNumber           INT NOT NULL,
        EmployeeId              INT NOT NULL,
        Type                    NVARCHAR(20) NOT NULL,
        Amount                  DECIMAL(18, 2) NOT NULL,
        PaymentDate             DATE NOT NULL,
        PaymentMethod           NVARCHAR(30) NULL,
        Reference               NVARCHAR(100) NULL,
        Notes                   NVARCHAR(500) NULL,
        PayrollPeriodId         INT NULL,
        PayrollSettlementId     INT NULL,
        DeductedInSettlementId  INT NULL,
        Status                  NVARCHAR(20) NOT NULL CONSTRAINT DF_EmployeePayment_Status DEFAULT (N'PAID'),
        PaidBy                  NVARCHAR(150) NULL,
        CreatedAt               DATETIME2 NOT NULL CONSTRAINT DF_EmployeePayment_CreatedAt DEFAULT (sysdatetime()),
        CONSTRAINT FK_EmployeePayment_Employee FOREIGN KEY (EmployeeId) REFERENCES dbo.Employee (Id),
        CONSTRAINT FK_EmployeePayment_Period FOREIGN KEY (PayrollPeriodId) REFERENCES dbo.PayrollPeriod (Id),
        CONSTRAINT FK_EmployeePayment_Settlement FOREIGN KEY (PayrollSettlementId) REFERENCES dbo.PayrollSettlement (Id),
        CONSTRAINT FK_EmployeePayment_Deducted FOREIGN KEY (DeductedInSettlementId) REFERENCES dbo.PayrollSettlement (Id),
        CONSTRAINT UQ_EmployeePayment_Number UNIQUE (PaymentNumber),
        CONSTRAINT CK_EmployeePayment_Type CHECK (
            Type IN (N'ADVANCE', N'PAYROLL')
        ),
        CONSTRAINT CK_EmployeePayment_Status CHECK (
            Status IN (N'PAID', N'VOID')
        )
    );
END

PRINT 'Módulo empleados y pagos: tablas listas.';
