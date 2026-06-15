/*
  Limpia TODOS los datos operativos de la base Rapid.
  Mantiene tablas y esquema; reinicia contadores IDENTITY.

  ⚠️  Destructivo e irreversible. Respalda antes si lo necesitas.

  Ejecutar:
    docker exec -i sqlserver-local /opt/mssql-tools18/bin/sqlcmd \
      -S localhost -U sa -P "TuPasswordSuperSegura123!" -d Rapid -C \
      -i /dev/stdin < scripts/sql/012-clean-all-data.sql
*/

USE [Rapid];
GO

SET NOCOUNT ON;
SET XACT_ABORT ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;

BEGIN TRY
    BEGIN TRANSACTION;

    PRINT N'Rompiendo referencias circulares…';

    IF COL_LENGTH('dbo.WorkOrder', 'QuotationId') IS NOT NULL
        UPDATE dbo.WorkOrder SET QuotationId = NULL;

    IF COL_LENGTH('dbo.Quotation', 'WorkOrderId') IS NOT NULL
        UPDATE dbo.Quotation SET WorkOrderId = NULL;

    IF OBJECT_ID('dbo.EmployeePayment', 'U') IS NOT NULL
    BEGIN
        UPDATE dbo.EmployeePayment
        SET DeductedInSettlementId = NULL,
            PayrollSettlementId = NULL;
    END

    PRINT N'Desactivando restricciones FK…';

    DECLARE @disableSql NVARCHAR(MAX) = N'';
    SELECT @disableSql += N'ALTER TABLE '
        + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
        + N'.'
        + QUOTENAME(OBJECT_NAME(parent_object_id))
        + N' NOCHECK CONSTRAINT '
        + QUOTENAME(name)
        + N';'
    FROM sys.foreign_keys;

    IF LEN(@disableSql) > 0
        EXEC sp_executesql @disableSql;

    PRINT N'Eliminando filas…';

    DECLARE @deleteSql NVARCHAR(MAX) = N'';
    SELECT @deleteSql += N'DELETE FROM '
        + QUOTENAME(SCHEMA_NAME(t.schema_id))
        + N'.'
        + QUOTENAME(t.name)
        + N';'
    FROM sys.tables AS t
    WHERE t.is_ms_shipped = 0
      AND t.name NOT LIKE N'sys%';

    IF LEN(@deleteSql) > 0
        EXEC sp_executesql @deleteSql;

    PRINT N'Reiniciando IDENTITY…';

    DECLARE @table SYSNAME;
    DECLARE @reseedSql NVARCHAR(300);

    DECLARE identity_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT t.name
        FROM sys.tables AS t
        INNER JOIN sys.identity_columns AS ic
            ON ic.object_id = t.object_id
        WHERE t.is_ms_shipped = 0;

    OPEN identity_cursor;
    FETCH NEXT FROM identity_cursor INTO @table;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @reseedSql = N'DBCC CHECKIDENT (''dbo.' + REPLACE(@table, '''', '''''') + N''', RESEED, 0);';
        EXEC sp_executesql @reseedSql;
        FETCH NEXT FROM identity_cursor INTO @table;
    END

    CLOSE identity_cursor;
    DEALLOCATE identity_cursor;

    PRINT N'Reactivando restricciones FK…';

    DECLARE @enableSql NVARCHAR(MAX) = N'';
    SELECT @enableSql += N'ALTER TABLE '
        + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
        + N'.'
        + QUOTENAME(OBJECT_NAME(parent_object_id))
        + N' WITH CHECK CHECK CONSTRAINT '
        + QUOTENAME(name)
        + N';'
    FROM sys.foreign_keys;

    IF LEN(@enableSql) > 0
        EXEC sp_executesql @enableSql;

    COMMIT TRANSACTION;

    PRINT N'Base de datos limpiada correctamente.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();
    RAISERROR(N'Error al limpiar la base: %s', 16, 1, @msg);
END CATCH;
GO
