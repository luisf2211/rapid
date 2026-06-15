/*
  Ordenes con factura PAID -> COMPLETED (si RECEIVED o IN_PROGRESS).

  1) En tu cliente SQL, conecta al servidor y abre la base Rapid.
  2) Ejecuta solo este archivo (T-SQL / SQL Server).

  Si la base no se llama Rapid, cambia la linea USE abajo.
*/
USE [Rapid];
GO

UPDATE [dbo].[WorkOrder]
SET
    [Status] = N'COMPLETED',
    [UpdatedAt] = SYSUTCDATETIME()
WHERE [Status] IN (N'RECEIVED', N'IN_PROGRESS')
  AND EXISTS (
      SELECT 1
      FROM [dbo].[Invoice] AS [i]
      WHERE [i].[WorkOrderId] = [dbo].[WorkOrder].[Id]
        AND [i].[Status] = N'PAID'
  );
GO
