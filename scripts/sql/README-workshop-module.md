# Scripts SQL — Módulo de gestión de taller (Rapid)

## Orden de ejecución

| Orden | Archivo | Qué hace |
|------|---------|----------|
| 1 | `create-inventory-tables.sql` | Inventario (ya existente) |
| 2 | `002-workshop-extend-existing-tables.sql` | Extiende `WorkOrder`, requisiciones, mano de obra, fotos |
| 3 | `003-workshop-quotation-tables.sql` | Cotización + líneas + daños + fotos |
| 4 | `004-workshop-invoice-audit-settings.sql` | Factura, auditoría, datos del taller |
| 5 | `005-quotation-deductible.sql` | Deducible en cotización aseguradora (si ya corriste 003) |
| 6 | `006-quotation-policy-number.sql` | Número de póliza (si ya corriste 003) |

```bash
sqlcmd -S localhost,1433 -d Rapid -U sa -P "tu_password" -i scripts/sql/002-workshop-extend-existing-tables.sql
sqlcmd -S localhost,1433 -d Rapid -U sa -P "tu_password" -i scripts/sql/003-workshop-quotation-tables.sql
sqlcmd -S localhost,1433 -d Rapid -U sa -P "tu_password" -i scripts/sql/004-workshop-invoice-audit-settings.sql
```

Luego en el proyecto:

```bash
npx prisma db pull
npx prisma generate
```

## Mapeo con la app actual

| Concepto del documento | Tabla en BD / app |
|------------------------|-------------------|
| Recepción | `WorkOrder` (+ `WorkOrderReception`, checklist, daños, fotos) |
| Cotización | `Quotation` (nueva) |
| Mano de obra | `LaborOrder` + `LaborOrderItem` |
| Requisición | `MaterialRequisition` + items |
| Inventario | `InventoryPart` + `InventoryMovement` |
| Facturación | `Invoice` + `InvoiceLine` |
| Auditoría | `AuditLog` |
| PDF / datos taller | `WorkshopSettings` |

## Reglas de negocio (a implementar en código)

1. **Cotización** → estados `DRAFT` → `APPROVED` → `CONVERTED`
2. **Recepción** solo si `Quotation.Status = APPROVED` y se asigna `WorkOrder.QuotationId`
3. **Requisición** `APPROVED` → salida de inventario (`InventoryMovement` OUT)
4. **Factura** arma totales desde mano de obra y requisiciones reales de la recepción
5. Cada acción crítica → insert en `AuditLog`

## Tablas nuevas (resumen)

### Cotización
- `Quotation` — cabecera (particular / aseguradora)
- `QuotationLaborLine` — MO estimada por área
- `QuotationMaterialLine` — materiales (opcional vínculo `InventoryPartId`)
- `QuotationPartLine` — repuestos
- `QuotationDamage` — inspección
- `QuotationPhoto` — evidencias

### Facturación
- `Invoice` — una factura activa por recepción (`WorkOrderId`)
- `InvoiceLine` — detalle con trazabilidad al origen

### Soporte
- `AuditLog` — bitácora
- `WorkshopSettings` — fila única (logo, ITBIS 18%, pies de PDF)

## Columnas nuevas en tablas existentes

Ver comentarios en `002-workshop-extend-existing-tables.sql` (estados, aprobación de requisición, técnico/horas en MO, `InventoryPartId` en ítems de requisición, etc.).

## Notas

- Los scripts `003` y `004` hacen `DROP` de tablas nuevas si se re-ejecutan; **no** borran `WorkOrder` ni datos del MVP.
- Órdenes antiguas sin cotización pueden tener `QuotationId` NULL hasta migración manual.
- ITBIS por defecto: **18%** (`0.18`).
