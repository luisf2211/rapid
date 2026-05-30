/*
  Rapid — Extensión de tablas existentes (MVP → flujo taller completo)
  Ejecutar DESPUÉS de inventario (001) y ANTES de cotización/factura (003-004).

  WorkOrder        = Recepción del vehículo
  MaterialRequisition / LaborOrder = operación en recepción
*/

USE Rapid;

-- ─── WorkOrder (Recepción) ───────────────────────────────────────────────────
IF COL_LENGTH('dbo.WorkOrder', 'QuotationId') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder ADD QuotationId INT NULL;
END

IF COL_LENGTH('dbo.WorkOrder', 'Vin') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder ADD Vin NVARCHAR(30) NULL;
END

IF COL_LENGTH('dbo.WorkOrder', 'NationalId') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder ADD NationalId NVARCHAR(30) NULL; -- Cédula / RNC
END

IF COL_LENGTH('dbo.WorkOrder', 'PromisedDate') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder ADD PromisedDate DATE NULL;
END

IF COL_LENGTH('dbo.WorkOrder', 'ReceivedAt') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder ADD ReceivedAt DATETIME2 NULL;
END

IF COL_LENGTH('dbo.WorkOrder', 'DeliveredAt') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrder ADD DeliveredAt DATETIME2 NULL;
END

IF COL_LENGTH('dbo.WorkOrder', 'ProgressPercent') IS NULL
BEGIN
    EXEC(N'
        ALTER TABLE dbo.WorkOrder
        ADD ProgressPercent DECIMAL(5,2) NOT NULL
            CONSTRAINT DF_WorkOrder_Progress DEFAULT (0);
    ');
END

-- Status en WorkOrder (si la tabla legacy no lo tuviera)
IF COL_LENGTH('dbo.WorkOrder', 'Status') IS NULL
BEGIN
    EXEC(N'
        ALTER TABLE dbo.WorkOrder
        ADD Status NVARCHAR(50) NOT NULL
            CONSTRAINT DF_WorkOrder_StatusCol DEFAULT (N''RECEIVED'');
    ');
END

-- Estados ampliados (SQL dinámico: evita error 207 sin GO entre batches)
IF COL_LENGTH('dbo.WorkOrder', 'Status') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.check_constraints
       WHERE name = N'CK_WorkOrder_Status' AND parent_object_id = OBJECT_ID(N'dbo.WorkOrder')
   )
BEGIN
    EXEC(N'
        ALTER TABLE dbo.WorkOrder ADD CONSTRAINT CK_WorkOrder_Status
        CHECK (Status IN (
            N''RECEIVED'', N''IN_PROGRESS'', N''WAITING_MATERIALS'', N''WAITING_PARTS'',
            N''READY_FOR_DELIVERY'', N''DELIVERED'', N''COMPLETED'', N''CANCELLED''
        ));
    ');
END

-- ─── Fotos: categorías del flujo ─────────────────────────────────────────────
IF COL_LENGTH('dbo.WorkOrderPhoto', 'Category') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrderPhoto ADD Category NVARCHAR(50) NULL;
    -- INSPECTION, RECEPTION, REPAIR, PAINT, ASSEMBLY, DELIVERY, GENERAL
END

IF COL_LENGTH('dbo.WorkOrderPhoto', 'CreatedBy') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrderPhoto ADD CreatedBy NVARCHAR(150) NULL;
END

-- ─── Daños: pieza afectada ─────────────────────────────────────────────────
IF COL_LENGTH('dbo.WorkOrderDamage', 'PartName') IS NULL
BEGIN
    ALTER TABLE dbo.WorkOrderDamage ADD PartName NVARCHAR(150) NULL;
END

-- ─── Requisición de materiales ─────────────────────────────────────────────
IF COL_LENGTH('dbo.MaterialRequisition', 'RequisitionNumber') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisition ADD RequisitionNumber INT NULL;
END

IF COL_LENGTH('dbo.MaterialRequisition', 'Status') IS NULL
BEGIN
    EXEC(N'
        ALTER TABLE dbo.MaterialRequisition
        ADD Status NVARCHAR(30) NOT NULL
            CONSTRAINT DF_MaterialRequisition_Status DEFAULT (N''PENDING'');
    ');
END

IF COL_LENGTH('dbo.MaterialRequisition', 'RequestedBy') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisition ADD RequestedBy NVARCHAR(150) NULL;
END

IF COL_LENGTH('dbo.MaterialRequisition', 'ApprovedBy') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisition ADD ApprovedBy NVARCHAR(150) NULL;
END

IF COL_LENGTH('dbo.MaterialRequisition', 'ApprovedAt') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisition ADD ApprovedAt DATETIME2 NULL;
END

IF COL_LENGTH('dbo.MaterialRequisition', 'DeliveredAt') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisition ADD DeliveredAt DATETIME2 NULL;
END

IF COL_LENGTH('dbo.MaterialRequisition', 'Status') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.check_constraints
       WHERE name = N'CK_MaterialRequisition_Status'
   )
BEGIN
    EXEC(N'
        ALTER TABLE dbo.MaterialRequisition ADD CONSTRAINT CK_MaterialRequisition_Status
        CHECK (Status IN (N''PENDING'', N''APPROVED'', N''DELIVERED'', N''CANCELLED''));
    ');
END

IF COL_LENGTH('dbo.MaterialRequisitionItem', 'InventoryPartId') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisitionItem ADD InventoryPartId INT NULL;
END

IF COL_LENGTH('dbo.MaterialRequisitionItem', 'LineType') IS NULL
BEGIN
    EXEC(N'
        ALTER TABLE dbo.MaterialRequisitionItem
        ADD LineType NVARCHAR(20) NOT NULL
            CONSTRAINT DF_MaterialRequisitionItem_LineType DEFAULT (N''MATERIAL'');
    ');
    -- MATERIAL | PART (repuesto)
END

IF COL_LENGTH('dbo.MaterialRequisitionItem', 'Unit') IS NULL
BEGIN
    ALTER TABLE dbo.MaterialRequisitionItem ADD Unit NVARCHAR(20) NULL;
END

-- FK a inventario (cuando exista la tabla)
IF OBJECT_ID(N'dbo.InventoryPart', N'U') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_MaterialRequisitionItem_InventoryPart'
   )
BEGIN
    ALTER TABLE dbo.MaterialRequisitionItem ADD CONSTRAINT FK_MaterialRequisitionItem_InventoryPart
        FOREIGN KEY (InventoryPartId) REFERENCES dbo.InventoryPart (Id);
END

-- ─── Mano de obra ──────────────────────────────────────────────────────────
IF COL_LENGTH('dbo.LaborOrder', 'OrderNumber') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD OrderNumber INT NULL;
END

IF COL_LENGTH('dbo.LaborOrder', 'Status') IS NULL
BEGIN
    EXEC(N'
        ALTER TABLE dbo.LaborOrder
        ADD Status NVARCHAR(30) NOT NULL
            CONSTRAINT DF_LaborOrder_Status DEFAULT (N''PENDING'');
    ');
END

IF COL_LENGTH('dbo.LaborOrder', 'Technician') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD Technician NVARCHAR(150) NULL;
END

IF COL_LENGTH('dbo.LaborOrder', 'Area') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD Area NVARCHAR(50) NULL;
    -- DESAB, PREP, PAINT, POLISH, ASSEMBLY
END

IF COL_LENGTH('dbo.LaborOrder', 'StartedAt') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD StartedAt DATETIME2 NULL;
END

IF COL_LENGTH('dbo.LaborOrder', 'FinishedAt') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD FinishedAt DATETIME2 NULL;
END

IF COL_LENGTH('dbo.LaborOrder', 'EstimatedHours') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD EstimatedHours DECIMAL(8,2) NULL;
END

IF COL_LENGTH('dbo.LaborOrder', 'ActualHours') IS NULL
BEGIN
    ALTER TABLE dbo.LaborOrder ADD ActualHours DECIMAL(8,2) NULL;
END

IF COL_LENGTH('dbo.LaborOrder', 'Status') IS NOT NULL
   AND NOT EXISTS (
       SELECT 1 FROM sys.check_constraints WHERE name = N'CK_LaborOrder_Status'
   )
BEGIN
    EXEC(N'
        ALTER TABLE dbo.LaborOrder ADD CONSTRAINT CK_LaborOrder_Status
        CHECK (Status IN (
            N''PENDING'', N''ASSIGNED'', N''IN_PROGRESS'', N''COMPLETED'', N''CANCELLED''
        ));
    ');
END

-- Movimientos de inventario: vínculo opcional a requisición
IF COL_LENGTH('dbo.InventoryMovement', 'MaterialRequisitionId') IS NULL
BEGIN
    ALTER TABLE dbo.InventoryMovement ADD MaterialRequisitionId INT NULL;
END

PRINT 'Tablas existentes extendidas correctamente.';
