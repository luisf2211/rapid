/*
  Detalle de trabajo vinculado a anticipos de efectivo.
  Ejecutar en base Rapid, luego: npx prisma db pull && npx prisma generate
*/

IF OBJECT_ID('dbo.EmployeePaymentWorkLine', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.EmployeePaymentWorkLine (
        Id                 INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_EmployeePaymentWorkLine PRIMARY KEY,
        EmployeePaymentId  INT NOT NULL,
        LaborOrderId       INT NOT NULL,
        LaborOrderItemId   INT NOT NULL,
        WorkOrderId        INT NOT NULL,
        WorkOrderNumber    INT NOT NULL,
        Plate              NVARCHAR(30) NULL,
        Description        NVARCHAR(250) NOT NULL,
        Quantity           DECIMAL(18, 2) NOT NULL,
        UnitPrice          DECIMAL(18, 2) NOT NULL,
        Amount             DECIMAL(18, 2) NOT NULL,
        CONSTRAINT FK_EmployeePaymentWorkLine_Payment
            FOREIGN KEY (EmployeePaymentId) REFERENCES dbo.EmployeePayment (Id) ON DELETE CASCADE,
        CONSTRAINT FK_EmployeePaymentWorkLine_LaborOrder
            FOREIGN KEY (LaborOrderId) REFERENCES dbo.LaborOrder (Id),
        CONSTRAINT FK_EmployeePaymentWorkLine_LaborItem
            FOREIGN KEY (LaborOrderItemId) REFERENCES dbo.LaborOrderItem (Id),
        CONSTRAINT FK_EmployeePaymentWorkLine_WorkOrder
            FOREIGN KEY (WorkOrderId) REFERENCES dbo.WorkOrder (Id)
    );

    CREATE INDEX IX_EmployeePaymentWorkLine_Payment
        ON dbo.EmployeePaymentWorkLine (EmployeePaymentId);

    CREATE INDEX IX_EmployeePaymentWorkLine_LaborItem
        ON dbo.EmployeePaymentWorkLine (LaborOrderItemId);
END
