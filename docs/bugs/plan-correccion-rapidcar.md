# Plan de Corrección — RapidCar

**Proyecto:** AutoPaint BearJack, S.R.L.  
**Fecha del plan:** 2026-07-04  
**Alcance:** Análisis técnico y plan de implementación (sin desarrollo en esta fase)

Este documento analiza las 16 observaciones del cliente, identifica causas raíz en el código actual de Rapid y propone soluciones concretas antes de iniciar el desarrollo.

---

## Resumen ejecutivo

| Categoría | Cantidad |
|-----------|----------|
| Bugs | 4 |
| Mejoras | 5 |
| Nuevas funcionalidades | 7 |

**Hallazgos clave del código actual:**

- El scroll al agregar líneas no usa `scrollIntoView`; el problema es reflow del layout (footer sticky + recálculo de totales).
- Las notas internas en recepción **se imprimen a propósito** en `ReceptionOrderDocument.tsx` — es un bug de plantilla, no de datos.
- `PromisedDate` existe en Prisma pero **nunca se conectó** al formulario ni al servicio.
- `WorkshopSettings` ya permite RNC, dirección y logo (URL); falta subida de logo integrada.
- No existen módulos de gastos, caja chica ni bancos.
- Las requisiciones grandes probablemente chocan con el **límite de payload de Server Actions** de Next.js (~1 MB por defecto).
- Supabase Storage ya está activo para imágenes; la firma puede fallar por políticas, env o campo `VarChar(500)` si la URL crece.

---

## 1. Scroll automático al agregar servicios o repuestos

**Tipo:** Bug  
**Prioridad:** Alta  
**Complejidad:** S  

**Descripción técnica:**  
Al pulsar “Agregar servicio” o “Agregar repuesto” en el formulario de cotización (`NewQuotationForm.tsx`), la vista se desplaza hacia abajo. El mismo patrón existe en requisiciones, órdenes de mano de obra y facturas (`useFieldArray` + `append` sin control de scroll).

**Causa raíz probable:**

1. Barra de acciones **sticky** en la parte inferior del formulario (`sticky bottom-0`) que fuerza reflow al crecer el contenido.
2. `useWatch` sobre `laborLines` / `partLines` recalcula totales y re-renderiza bloques inferiores en cada append.
3. No hay `scrollIntoView`, `preventScroll` ni foco controlado tras agregar filas.
4. No existe `scrollIntoView` en ningún archivo del proyecto.

**Solución propuesta:**

1. Eliminar o condicionar el sticky del footer en formularios con listas dinámicas (solo móvil, o reemplazar por barra fija fuera del flujo del scroll).
2. Tras `append`, usar `requestAnimationFrame` + `scrollTo` para **restaurar** `window.scrollY` previo, o mantener ancla en el botón “Agregar”.
3. Aislar el bloque de totales (`previewTotals`) para que no provoque saltos de layout (altura mínima reservada o memoización).
4. Aplicar el mismo patrón en `RequisitionLinesEditor.tsx`, `LaborOrderForm.tsx` y `EditInvoiceForm.tsx`.

**Archivos o módulos afectados:**

- `src/app/(app)/quotations/new/NewQuotationForm.tsx`
- `src/components/material-requisition/RequisitionLinesEditor.tsx`
- `src/components/labor-order/LaborOrderForm.tsx`
- `src/app/(app)/invoices/[id]/edit/EditInvoiceForm.tsx`

**Dependencias:** Ninguna.

**Riesgos:**

- Cambiar sticky puede afectar UX móvil del botón “Guardar”.
- Restaurar scroll manualmente puede sentirse artificial en algunos navegadores.

**Checklist técnico:**

- [ ] Reproducir en cotización, requisición y factura (Chrome + Safari móvil).
- [ ] Medir `scrollY` antes/después de `append` para confirmar hipótesis.
- [ ] Implementar preservación de scroll o quitar sticky conflictivo.
- [ ] Verificar que agregar 10+ líneas seguidas no mueve la vista.
- [ ] Regresión: totales siguen calculándose correctamente.

**Criterios de aceptación:**

- [ ] Al agregar servicio o repuesto, la posición de scroll no cambia de forma perceptible.
- [ ] El usuario puede agregar 5+ líneas consecutivas sin perder el contexto del formulario.
- [ ] Funciona en escritorio y móvil.

**Estimación:** 4–6 horas

---

## 2. Error al aplicar la firma

**Tipo:** Bug  
**Prioridad:** Crítica  
**Complejidad:** M  

**Descripción técnica:**  
Al confirmar la firma en recepción (`SignaturePad` → `POST /api/upload/signature` → Supabase Storage → campo `customerReceivedSignature`), el usuario recibe error.

**Causa raíz probable:**

1. **Storage Supabase:** bucket `rapid`, políticas RLS o variables `NEXT_PUBLIC_SUPABASE_*` mal configuradas en el entorno de despliegue.
2. **Modo dual local/cloud:** `shouldUseSupabaseStorage()` activo pero URLs resueltas incorrectamente en preview/print.
3. **Longitud de campo:** `WorkOrderReception.customerReceivedSignature` es `VarChar(500)`; URLs públicas de Supabase caben hoy, pero rutas largas o tokens firmados podrían exceder el límite al **guardar la orden** (no solo al subir).
4. **Canvas:** `ResizeObserver` en `SignaturePad` puede limpiar trazos si el contenedor cambia de tamaño antes de confirmar.
5. **Middleware:** la ruta API no es pública; fallaría solo si la sesión expira mid-flow.

**Solución propuesta:**

1. Auditar flujo end-to-end con logs en `saveSignaturePng` y respuesta de Storage.
2. Verificar env en producción: `NEXT_PUBLIC_SUPABASE_URL`, publishable/service key, `SUPABASE_STORAGE_BUCKET`, políticas del bucket.
3. Ampliar `customerReceivedSignature` a `VarChar(1000)` o almacenar **path relativo** (`firmas/uuid.png`) y resolver URL en display/print.
4. Manejo de errores visible en `SignaturePad` con mensaje específico (Storage vs red vs validación).
5. Probar firma en PDF de recepción (`ReceptionOrderDocument.tsx` + `resolvePhotoUrl`).
6. Test E2E: capturar → confirmar → guardar orden → imprimir.

**Archivos o módulos afectados:**

- `src/components/forms/SignaturePad.tsx`
- `src/app/api/upload/signature/route.ts`
- `src/lib/uploads.ts`, `src/lib/storage/signatures.ts`
- `src/lib/supabase/storage-config.ts`
- `src/lib/photos.ts`
- `src/services/work-orders.service.ts`
- `src/components/work-order/print/ReceptionOrderDocument.tsx`
- `prisma/schema.prisma` (longitud del campo)

**Dependencias:** Configuración Supabase Storage (ya iniciada en el proyecto).

**Riesgos:**

- Migración de URLs existentes si se cambia formato de almacenamiento.
- Políticas públicas del bucket en producción (seguridad).

**Checklist técnico:**

- [ ] Reproducir error y capturar respuesta HTTP de `/api/upload/signature`.
- [ ] Confirmar upload en dashboard Supabase (`rapid/firmas/`).
- [ ] Validar `resolvePhotoUrl` en pantalla e impresión.
- [ ] Revisar longitud de URL vs `VarChar(500)`.
- [ ] Probar guardado completo de orden con firma.
- [ ] Documentar variables de entorno requeridas.

**Criterios de aceptación:**

- [ ] Confirmar firma guarda imagen sin error.
- [ ] La firma se ve en el formulario tras confirmar.
- [ ] La firma aparece en la impresión/PDF de recepción.
- [ ] La firma persiste al reabrir la orden.

**Estimación:** 1–2 días

---

## 3. Orden de recepción — Color del checklist

**Tipo:** Mejora  
**Prioridad:** Media  
**Complejidad:** S  

**Descripción técnica:**  
Los checks marcados en la orden de recepción impresa se ven demasiado claros o invisibles en blanco y negro.

**Causa raíz probable:**

- `invoice-print.css` aplica `print-color-adjust: economy`, lo que **elimina fondos** al imprimir.
- Los checks marcados usan `background: #000` + `✓` blanco (`.idoc-check-box.on` en `reception-print.css`).
- En impresión B/N el fondo desaparece y solo queda un borde tenue.

**Solución propuesta:**

1. Cambiar checks a diseño **sin dependencia de color de fondo**: borde grueso + carácter `✓` o `☑` en negro sólido.
2. Aplicar `print-color-adjust: exact` solo en `.idoc-check-box` (como ya hace `quotation-print.css`).
3. Probar impresión real y “Guardar como PDF” en Chrome.

**Archivos o módulos afectados:**

- `src/app/print/reception-print.css`
- `src/app/print/invoice-print.css` (herencia)
- `src/components/work-order/print/ReceptionOrderDocument.tsx`

**Dependencias:** Ninguna.

**Riesgos:** Mínimos; cambio solo visual en print.

**Checklist técnico:**

- [ ] Actualizar estilos de `.idoc-check-box` y `.idoc-check-box.on`.
- [ ] Verificar contraste en impresora láser B/N.
- [ ] Comparar vista previa vs PDF exportado.
- [ ] Regresión: checks sin marcar siguen legibles.

**Criterios de aceptación:**

- [ ] Checks marcados son claramente visibles en impresión B/N.
- [ ] No dependen de “Imprimir fondos” del navegador.
- [ ] Layout del checklist no se rompe.

**Estimación:** 2–4 horas

---

## 4. Orden de recepción — Notas internas visibles

**Tipo:** Bug  
**Prioridad:** Alta  
**Complejidad:** S  

**Descripción técnica:**  
El campo `WorkOrder.notes` (“Notas internas”) aparece en la orden impresa entregada al cliente.

**Causa raíz probable:**

- Bug de plantilla: `reception-print-data.ts` incluye `order.notes` y `ReceptionOrderDocument.tsx` lo renderiza explícitamente con etiqueta “Notas internas:”.
- No es filtrado incorrecto de datos; es **intención errónea en el documento de impresión**.

**Solución propuesta:**

1. Eliminar bloque de notas internas de `ReceptionOrderDocument.tsx`.
2. Mantener `observations` (observaciones de recepción visibles al cliente) separadas de `notes`.
3. Revisar que ningún otro documento al cliente (cotización, factura) exponga `internalNotes` — hoy cotización ya lo excluye en `print-data.ts`.
4. Añadir test/regresión visual en checklist de QA.

**Archivos o módulos afectados:**

- `src/components/work-order/print/ReceptionOrderDocument.tsx`
- `src/lib/work-order/reception-print-data.ts`

**Dependencias:** Ninguna.

**Riesgos:** Bajo; solo afecta print de recepción.

**Checklist técnico:**

- [ ] Quitar render de `data.notes` en documento cliente.
- [ ] Confirmar que detalle interno (`/work-orders/[id]`) sigue mostrando notas.
- [ ] Revisar PDF/print de otros módulos por campos “internal”.

**Criterios de aceptación:**

- [ ] Notas internas NO aparecen en PDF, impresión ni vista print de recepción.
- [ ] Siguen visibles dentro del sistema (detalle de orden).
- [ ] Observaciones de recepción del cliente siguen imprimiéndose si aplica.

**Estimación:** 1–2 horas

---

## 5. Orden de recepción — Fecha estimada de entrega

**Tipo:** Mejora  
**Prioridad:** Alta  
**Complejidad:** M  

**Descripción técnica:**  
Falta campo editable “Fecha estimada de entrega” en recepción, visible en pantalla, PDF e impresión.

**Causa raíz probable:**

- `WorkOrder.PromisedDate` existe en Prisma (migración SQL histórica) pero **cero referencias** en `src/`.
- `WorkOrderReception.exitDate` / `exitTime` ya se muestran en print como “Salida estimada” pero **no están en formulario ni en `receptionData()`** del servicio.
- Duplicidad de conceptos sin decisión de producto.

**Solución propuesta:**

1. **Decisión recomendada:** usar `WorkOrderReception.exitDate` (+ `exitTime` opcional) como “Fecha estimada de entrega” — ya wired en print parcialmente.
2. Agregar campos al formulario (`WorkOrderForm.tsx`), validación (`work-order.ts`), mapper (`form-mapper.ts`) y persistencia (`work-orders.service.ts`).
3. Alternativa: usar `WorkOrder.PromisedDate` si se prefiere a nivel orden; evitar duplicar ambos.
4. Mostrar en detalle de orden y en `ReceptionOrderDocument.tsx` con etiqueta clara: “Fecha estimada de entrega”.

**Archivos o módulos afectados:**

- `src/components/work-order/WorkOrderForm.tsx`
- `src/lib/validations/work-order.ts`
- `src/lib/work-order/form-mapper.ts`
- `src/services/work-orders.service.ts`
- `src/lib/work-order/reception-print-data.ts`
- `src/components/work-order/print/ReceptionOrderDocument.tsx`
- `src/app/(app)/work-orders/[id]/page.tsx`

**Dependencias:** Ninguna (columnas ya existen en BD).

**Riesgos:**

- Confusión si coexisten `PromisedDate` y `exitDate` sin documentar.
- Datos históricos vacíos en órdenes migradas.

**Checklist técnico:**

- [x] Definir campo canónico (exitDate vs PromisedDate).
- [x] Agregar input fecha (+ hora opcional) al formulario.
- [x] Persistir en create/update de recepción.
- [x] Mostrar en detalle y print con etiqueta acordada.
- [ ] Migración de datos si hay valores legacy en una columna u otra.

**Criterios de aceptación:**

- [x] Usuario puede ingresar fecha estimada de entrega al crear/editar recepción.
- [x] Se muestra en pantalla de detalle.
- [x] Aparece en PDF e impresión de recepción.
- [x] Se guarda y recupera correctamente tras recargar.

**Estimación:** 1 día

---

## 6. Configuración de empresa

**Tipo:** Mejora  
**Prioridad:** Media  
**Complejidad:** M  

**Descripción técnica:**  
Actualizar información de empresa: nombre, RNC, dirección, logo. Validar si debe ser configurable desde el sistema o por variables de entorno.

**Causa raíz probable:**

- **Ya existe** módulo `/settings` con `WorkshopSettings`: `businessName`, `legalName`, `rnc`, `address`, `logoUrl`, `stampUrl`.
- Fallback por env (`NEXT_PUBLIC_WORKSHOP_*`) en `print-info.ts`.
- Gap principal: logo es **campo de texto URL**, sin widget de subida; no hay integración con Supabase Storage (`taller/`).

**Solución propuesta:**

1. **Recomendación:** mantener configuración en sistema (`WorkshopSettings` por empresa), env solo como fallback de despliegue.
2. Agregar uploader de logo/sello reutilizando `/api/upload` con subfolder `workshop` → Storage `taller/`.
3. Preview en vivo en `WorkshopSettingsForm.tsx`.
4. Pre-cargar datos de AutoPaint BearJack en seed o pantalla admin.
5. Documentar qué va en `Company` (tenant) vs `WorkshopSettings` (datos fiscales/comerciales).

**Archivos o módulos afectados:**

- `src/app/(app)/settings/WorkshopSettingsForm.tsx`
- `src/app/(app)/settings/actions.ts`
- `src/services/workshop-settings.service.ts`
- `src/lib/workshop/print-info.ts`
- `src/lib/uploads.ts` (subfolder workshop)
- `prisma/schema.prisma` → `WorkshopSettings`

**Dependencias:** Supabase Storage (ya implementado).

**Riesgos:**

- Logos grandes en print pueden desbordar layout (relacionado con req #13).

**Checklist técnico:**

- [ ] Confirmar campos actuales cubren nombre, RNC, dirección.
- [ ] Implementar upload de logo/sello.
- [ ] Verificar propagación a todos los documentos print.
- [ ] Actualizar datos BearJack en entorno del cliente.
- [ ] Documentar variables env vs BD.

**Criterios de aceptación:**

- [ ] Admin de empresa puede editar nombre, RNC, dirección desde `/settings`.
- [ ] Puede subir logo sin pegar URL manual.
- [ ] Logo aparece en recepción, cotización y factura impresas.
- [ ] Cambios persisten por empresa (multi-tenant).

**Estimación:** 1–2 días

---

## 7. Dashboard financiero

**Tipo:** Mejora  
**Prioridad:** Alta  
**Complejidad:** L  

**Descripción técnica:**  
Agregar estadísticas de ingresos, costos y gastos al dashboard.

**Causa raíz probable:**

- Dashboard actual (`DashboardFinance.tsx`) solo muestra **costos internos**: materiales + mano de obra.
- **Ingresos** existen en `Invoice.grandTotal` pero no se agregan al dashboard.
- **Gastos** no tienen modelo de datos (req #8 pendiente).
- No hay filtros por período ni margen bruto.

**Solución propuesta:**

**Fase 1 (sin módulo gastos):**

| Indicador | Fuente de datos |
|-----------|-----------------|
| Ingresos | `Invoice` status PAID (o facturado según regla de negocio) — `sum(grandTotal)` |
| Costos materiales | Ya existe — requisiciones |
| Costos mano de obra | Ya existe — labor orders |
| Margen bruto estimado | Ingresos − (materiales + labor) |

**Fase 2 (con módulo gastos):**

- Sumar `Expense.amount` al bloque de gastos operativos.
- KPI: utilidad neta estimada.

Implementar en `work-orders.service.ts` o nuevo `dashboard-finance.service.ts`, componentes en `DashboardFinance.tsx`, filtros mes/quincena.

**Archivos o módulos afectados:**

- `src/app/(app)/dashboard/page.tsx`
- `src/components/dashboard/DashboardFinance.tsx`
- `src/services/work-orders.service.ts` (o servicio nuevo)
- `src/services/invoices.service.ts`
- Futuro: `src/services/expenses.service.ts`

**Dependencias:** Req #8 para gastos completos; puede entregarse parcial sin él.

**Riesgos:**

- Definición de “ingreso” (facturado vs cobrado) debe acordarse con cliente.
- Mezclar payroll (`payments/`) con P&L operativo puede confundir.

**Checklist técnico:**

- [ ] Definir reglas de negocio para ingresos y costos con cliente.
- [ ] Crear queries agregadas por `CompanyId` y rango de fechas.
- [ ] Actualizar UI con tarjetas y totales formateados (RD$).
- [ ] Excluir facturas anuladas (`voidedAt`).
- [ ] Integrar gastos cuando exista módulo #8.
- [ ] Pruebas con datos BearJack migrados.

**Criterios de aceptación:**

- [ ] Dashboard muestra ingresos, costos y margen del período seleccionado.
- [ ] Cifras coinciden con sumatoria manual de facturas/requisiciones del período.
- [ ] Al agregar gastos, el indicador de gastos se actualiza.

**Estimación:** 3–5 días (fase 1: 2 días; fase 2: +2 días)

---

## 8. Nuevo módulo — Gastos

**Tipo:** Nueva Funcionalidad  
**Prioridad:** Alta  
**Complejidad:** XL  

**Descripción técnica:**  
Módulo para registrar gastos operativos con categorías, proveedores, adjuntos y relación con caja chica.

**Causa raíz probable:**  
No existe modelo, servicio, UI ni rutas para gastos. El dashboard y futuros reportes financieros lo requieren.

**Solución propuesta:**

**Modelo Prisma sugerido:**

```
ExpenseCategory (id, companyId, name, isActive)
Vendor (id, companyId, name, rnc?, phone?)
Expense (id, companyId, categoryId, vendorId?, amount, expenseDate,
         description, receiptUrl?, paymentMethod, pettyCashSessionId?,
         createdBy, createdAt)
```

**Funcionalidades MVP:**

- CRUD gastos con categorías predefinidas (combustible, servicios, materiales menores, etc.)
- Adjunto de comprobante → Supabase Storage `gastos/`
- Listado filtrable por fecha/categoría
- Vínculo opcional con sesión de caja chica (req #11)

**Archivos o módulos afectados (nuevos):**

- `prisma/schema.prisma`
- `src/app/(app)/expenses/` (pages, forms, actions)
- `src/services/expenses.service.ts`
- `src/lib/validations/expense.ts`
- Sidebar nav, dashboard integration

**Dependencias:** Supabase Storage; recomendable después de req #11 (caja chica) o en paralelo con interfaz desacoplada.

**Riesgos:**

- Alcance XL si incluye aprobaciones, multi-moneda, integración contable.
- Duplicar gastos ya capturados en requisiciones/inventario.

**Checklist técnico:**

- [ ] Diseñar schema y migración Supabase.
- [ ] CRUD + validaciones Zod.
- [ ] Upload de comprobantes.
- [ ] Permisos por rol (COMPANY_ADMIN vs operador).
- [ ] Reporte simple exportable.
- [ ] Integración dashboard (req #7).
- [ ] Enlace opcional a caja chica.

**Criterios de aceptación:**

- [ ] Usuario registra gasto con monto, fecha, categoría y descripción.
- [ ] Puede adjuntar foto/PDF de comprobante.
- [ ] Listado y filtros funcionan por empresa.
- [ ] Gastos aparecen en dashboard financiero.

**Estimación:** 2–3 semanas (MVP)

---

## 9. Comunicación con clientes

**Tipo:** Nueva Funcionalidad  
**Prioridad:** Media  
**Complejidad:** L  

**Descripción técnica:**  
Enviar orden de recepción, cotización y factura por WhatsApp y correo electrónico.

**Causa raíz probable:**

- Solo existen links estáticos `mailto:` / `wa.me` en landing.
- Documentos print son HTML en rutas `/print/...` — **no hay generación PDF server-side** ni envío integrado.
- No hay SMTP configurado ni plantillas de correo.

**Solución propuesta:**

**Fase 1 — Enlaces enriquecidos (rápido):**

- Botones “Enviar por WhatsApp” con URL del print + mensaje prellenado.
- Botones `mailto:` con asunto y cuerpo; usuario adjunta PDF manualmente desde print.

**Fase 2 — PDF automático:**

- Librería server-side (`@react-pdf/renderer`, Puppeteer, o API externa) para generar PDF desde datos existentes (`print-data.ts`).
- Almacenar PDF temporal en Supabase Storage o generar on-demand.

**Fase 3 — Envío automático:**

- **Email:** Resend, SendGrid o SMTP (`nodemailer`) con plantillas React Email.
- **WhatsApp:** enlaces `wa.me` con PDF público (link firmado) o integración WhatsApp Business API (costo/complejidad alta).

**Archivos o módulos afectados:**

- `src/app/(app)/quotations/[id]/page.tsx` (acciones)
- `src/app/(app)/work-orders/[id]/page.tsx`
- `src/app/(app)/invoices/[id]/page.tsx`
- `src/components/invoice/InvoiceDetailActions.tsx` (patrón existente)
- Nuevo: `src/services/notifications.service.ts`, `src/lib/pdf/`

**Dependencias:** Print data estable (req #13); Storage para PDFs; variables SMTP/WhatsApp en env.

**Riesgos:**

- WhatsApp Business API requiere aprobación Meta y costos.
- PDF server-side en Vercel tiene límites de tiempo/memoria.
- Privacidad: PDFs con datos de cliente en URLs públicas.

**Checklist técnico:**

- [ ] Definir alcance MVP (wa.me + mailto vs envío automático).
- [ ] Implementar generación PDF por tipo de documento.
- [ ] Plantillas de mensaje configurables por taller.
- [ ] Configurar proveedor SMTP y probar entrega.
- [ ] Auditoría: log de envíos (quién, cuándo, a quién).
- [ ] URLs firmadas con expiración para PDFs.

**Criterios de aceptación:**

- [ ] Desde cotización, recepción y factura hay acción de compartir.
- [ ] WhatsApp abre conversación con mensaje y enlace/PDF acordado.
- [ ] Email envía PDF adjunto (fase 2+) o instrucciones claras (fase 1).
- [ ] Solo usuarios autorizados pueden enviar.

**Estimación:** 1–2 semanas (MVP fase 1: 2 días; fase 2–3: +1–2 semanas)

---

## 10. Requisiciones grandes

**Tipo:** Bug  
**Prioridad:** Crítica  
**Complejidad:** M  

**Descripción técnica:**  
Requisiciones con muchos materiales fallan y obligan a guardar por partes.

**Causa raíz probable:**

1. **Límite de Server Actions de Next.js** (~1 MB body por defecto); `next.config.ts` no define `serverActions.bodySizeLimit`.
2. Formulario envía **todas las líneas** (incluidas vacías) en un solo payload JSON.
3. Transacción única en Prisma con N movimientos de inventario — posible timeout en lotes muy grandes.
4. Sin paginación, batching ni endpoint API dedicado con streaming.

**Solución propuesta:**

1. Corto plazo: aumentar `serverActions.bodySizeLimit` en `next.config.ts` (ej. `10mb`).
2. Filtrar líneas vacías **antes** del submit en cliente (parcialmente existe en `toMaterialRequisitionInput`).
3. Medio plazo: migrar create a **Route Handler** `POST /api/material-requisitions` sin límite tan estricto.
4. Largo plazo: guardado por lotes o transacciones chunked si N > 100 líneas.
5. Agregar test de carga con 50, 100, 200 líneas.

**Archivos o módulos afectados:**

- `next.config.ts`
- `src/app/(app)/material-requisitions/actions.ts`
- `src/app/(app)/material-requisitions/new/NewMaterialRequisitionForm.tsx`
- `src/services/material-requisitions.service.ts`
- `src/lib/validations/material-requisition.ts`

**Dependencias:** Ninguna.

**Riesgos:**

- Aumentar body limit expone a payloads grandes (DoS) — validar auth + max líneas razonable (ej. 500).
- Transacciones largas pueden bloquear filas de inventario.

**Checklist técnico:**

- [ ] Reproducir con N líneas y capturar error exacto (413, 500, timeout).
- [ ] Configurar `bodySizeLimit` y redeploy.
- [ ] Strip de filas vacías en payload final.
- [ ] Opcional: límite máximo documentado en UI.
- [ ] Prueba de regresión stock/inventario con requisición grande.
- [ ] Considerar API route si Server Action sigue fallando.

**Criterios de aceptación:**

- [ ] Requisición con ≥50 materiales se guarda en una sola operación.
- [ ] Inventario se actualiza correctamente para todas las líneas.
- [ ] No hay error de payload en condiciones normales de uso.

**Estimación:** 1–2 días

---

## 11. Nuevo módulo — Caja chica

**Tipo:** Nueva Funcionalidad  
**Prioridad:** Media  
**Complejidad:** XL  

**Descripción técnica:**  
Control de caja chica: apertura, cierre, movimientos, responsables y reportes.

**Causa raíz probable:**  
No existe módulo de tesorería menor. Pagos de empleados (`payments/`) es nómina, no caja chica.

**Solución propuesta:**

**Modelo sugerido:**

```
PettyCashSession (id, companyId, openedAt, closedAt?, openingBalance,
                  closingBalance?, responsibleUserId, status OPEN|CLOSED)
PettyCashMovement (id, sessionId, type IN|OUT, amount, description,
                   expenseId?, createdBy, createdAt)
```

**Flujos:**

1. Apertura con saldo inicial y responsable.
2. Egresos vinculados a `Expense` o movimiento directo (tornillos, comida, etc.).
3. Cierre con arqueo (saldo esperado vs contado).
4. Reporte PDF del período.

**Archivos o módulos afectados (nuevos):**

- `prisma/schema.prisma`
- `src/app/(app)/petty-cash/`
- `src/services/petty-cash.service.ts`
- Integración con req #8 (gastos)

**Dependencias:** Req #8 recomendado; puede iniciarse con movimientos standalone.

**Riesgos:**

- Control de concurrencia (dos usuarios moviendo la misma caja).
- Permisos: solo responsable o admin puede cerrar.

**Checklist técnico:**

- [ ] Schema + migración.
- [ ] Flujo apertura/cierre con validaciones.
- [ ] Movimientos IN/OUT con saldo running.
- [ ] Reporte imprimible.
- [ ] Integración gastos.
- [ ] Auditoría en `AuditLog`.

**Criterios de aceptación:**

- [ ] Solo una caja abierta por empresa a la vez (o regla acordada).
- [ ] Movimientos actualizan saldo disponible en tiempo real.
- [ ] Cierre genera reporte con totales y diferencias.
- [ ] Ejemplos del cliente (tornillos, comida) registrables.

**Estimación:** 2–3 semanas

---

## 12. Nuevo módulo — Bancos

**Tipo:** Nueva Funcionalidad  
**Prioridad:** Baja  
**Complejidad:** XL  

**Descripción técnica:**  
Visualizar dinero disponible: cuentas, balances, movimientos, transferencias y base para conciliación futura.

**Causa raíz probable:**  
No hay entidades de tesorería bancaria. Ingresos por factura y egresos por requisiciones/gastos no se consolidan en cuentas.

**Solución propuesta:**

**Modelo sugerido (MVP):**

```
BankAccount (id, companyId, name, bankName, accountNumber, currency,
             openingBalance, isActive)
BankMovement (id, accountId, type CREDIT|DEBIT|TRANSFER, amount,
              movementDate, description, referenceType?, referenceId?)
BankTransfer (id, fromAccountId, toAccountId, amount, transferDate)
```

**MVP:** CRUD cuentas, movimientos manuales, balance calculado, listado por cuenta.  
**Futuro:** conciliación con extractos CSV, integración pagos.

**Archivos o módulos afectados (nuevos):**

- `prisma/schema.prisma`
- `src/app/(app)/banking/`
- `src/services/banking.service.ts`
- Dashboard: saldo total disponible

**Dependencias:** Req #7, #8, #11 para coherencia financiera global.

**Riesgos:**

- Alcance XL si se busca paridad con software contable.
- Duplicación con facturación si no se define qué movimientos son automáticos.

**Checklist técnico:**

- [ ] Definir MVP vs conciliación futura con cliente.
- [ ] Schema cuentas y movimientos.
- [ ] UI saldo por cuenta y total.
- [ ] Transferencias entre cuentas (transacción DB).
- [ ] Hooks para registrar ingreso al marcar factura pagada (fase 2).
- [ ] Reporte movimientos por período.

**Criterios de aceptación:**

- [ ] Usuario crea cuentas bancarias de la empresa.
- [ ] Registra movimientos y ve balance actualizado.
- [ ] Transferencias afectan ambas cuentas atómicamente.
- [ ] Dashboard muestra liquidez total (opcional fase 2).

**Estimación:** 3–4 semanas (MVP: 2 semanas)

---

## 13. Impresiones

**Tipo:** Mejora  
**Prioridad:** Alta  
**Complejidad:** L  

**Descripción técnica:**  
Las impresiones no caben correctamente: márgenes, saltos de página, escalado.

**Causa raíz probable:**

- CSS print fragmentado: `quotation-print.css`, `invoice-print.css`, `reception-print.css`, `print-stamp.css`.
- `@page { size: letter; margin: 12mm }` uniforme puede no servir para todos los documentos.
- Requisiciones y órdenes de mano de obra reutilizan `invoice-print.css` sin tuning propio.
- Tablas largas, fotos y checklist sin suficientes `page-break-inside: avoid`.
- Sin `@media print` de escalado (`transform: scale`) para contenido ancho.
- Material requisition print usa padding inline en wrapper screen.

**Solución propuesta:**

1. Auditoría visual documento por documento (recepción, cotización privada/seguro, factura, requisición, mano de obra, nómina).
2. Crear CSS dedicado donde falte (`material-requisition-print.css`, `labor-order-print.css`).
3. Estandarizar `@page`, márgenes, tipografía print (9–10pt cuerpo).
4. Reglas de page-break en firmas, fotos, tablas > N filas.
5. Opcional: `@page :first` para encabezado compacto.
6. Guía QA de impresión en `docs/print-qa.md`.

**Archivos o módulos afectados:**

- `src/app/print/*.css`
- `src/app/print/layout.tsx`
- Componentes `*Document.tsx` en `components/*/print/`
- `src/components/material-requisition/print/MaterialRequisitionDocument.tsx`

**Dependencias:** Req #3, #4, #5, #16 (contenido legal extra en recepción).

**Riesgos:**

- Cambios CSS pueden romper un documento al arreglar otro.
- Diferencias entre Chrome print, Safari y PDF.

**Checklist técnico:**

- [ ] Inventario de todos los tipos de print y rutas.
- [ ] Capturas antes/después en letter y A4.
- [ ] Ajustar márgenes y page-breaks por documento.
- [ ] Probar con datos reales BearJack (cotización larga, checklist completo).
- [ ] Verificar logos desde Supabase Storage en print.
- [ ] Regresión req #3 checks visibles.

**Criterios de aceptación:**

- [ ] Información principal visible sin cortes críticos en una página o con saltos predecibles.
- [ ] Firmas, totales y datos legales no quedan solos en página siguiente de forma awkward.
- [ ] Consistencia visual entre tipos de documento.
- [ ] Aprobación del cliente en impresión real.

**Estimación:** 1–2 semanas

---

## 14. Recepción — Diagrama del automóvil

**Tipo:** Nueva Funcionalidad  
**Prioridad:** Media  
**Complejidad:** XL  

**Descripción técnica:**  
Dibujo interactivo del vehículo para marcar daños en todas las piezas, exportable al PDF.

**Causa raíz probable:**

- Daños hoy son texto/tabla: `WorkOrderDamage` con `side`, `damageType`, coordenadas X/Y opcionales en formulario (`WorkOrderForm.tsx`).
- No hay SVG/canvas ni render en print.

**Solución propuesta:**

1. **SVG top-view + side views** (4 lados) con zonas clicables — librería ligera o SVG custom.
2. Al click, modal/select de tipo de daño; persistir `{ zoneId, x, y, damageType, notes }`.
3. Extender `WorkOrderDamage` o nueva tabla `WorkOrderDamageMarker` con `zoneCode`, `posX`, `posY`, `view`.
4. Export: SVG embebido en print o PNG generado server-side para PDF.
5. Modo lectura en detalle e impresión con leyenda numerada.

**Archivos o módulos afectados:**

- Nuevo: `src/components/work-order/VehicleDamageDiagram.tsx`
- `src/components/work-order/WorkOrderForm.tsx`
- `src/services/work-orders.service.ts`
- `src/lib/work-order/reception-print-data.ts`
- `src/components/work-order/print/ReceptionOrderDocument.tsx`
- `prisma/schema.prisma`

**Dependencias:** Req #13 (espacio en print); posible Storage para snapshot PNG.

**Riesgos:**

- Complejidad UX (móvil vs desktop).
- Muchas marcas pueden saturar el diagrama en print.
- Compatibilidad con daños legacy en formato texto.

**Checklist técnico:**

- [ ] Diseñar SVG/zonas con cliente (sedán, SUV genérico).
- [ ] Componente interactivo + persistencia.
- [ ] Migración daños existentes.
- [ ] Render en print (SVG o imagen).
- [ ] Accesibilidad: lista textual alternativa de daños.
- [ ] Pruebas touch en tablet.

**Criterios de aceptación:**

- [ ] Usuario marca daños en múltiples zonas del vehículo visualmente.
- [ ] Daños se guardan y recuperan al editar recepción.
- [ ] Diagrama (o leyenda numerada vinculada) aparece en PDF/impresión.
- [ ] Coexiste con checklist y firma sin romper layout.

**Estimación:** 3–4 semanas

---

## 15. Checklist de recepción — Nuevos campos

**Tipo:** Mejora  
**Prioridad:** Media  
**Complejidad:** M  

**Descripción técnica:**  
Agregar Alfombras (Tela, Goma), Radar, Sensores, Cámara trasera; diseñar extensibilidad futura sin cambios de código.

**Causa raíz probable:**

- Lista **hardcodeada** en `CHECKLIST_ITEMS` (`constants.ts`) — 26 ítems, un solo “Alfombras”.
- DB normalizada (`WorkOrderReceptionChecklist`) guarda `itemName` por fila — extensible en datos pero no en UI sin deploy.

**Solución propuesta:**

**Corto plazo:**

- Agregar ítems a `CHECKLIST_ITEMS`: `carpetsFabric`, `carpetsRubber`, `radar`, `parkingSensors`, `rearCamera`.
- Actualizar `checklist.ts` mapping y print labels.

**Medio plazo (extensibilidad):**

- Tabla `ChecklistTemplateItem (companyId, code, label, sortOrder, isActive)`.
- Admin en settings para activar/desactivar ítems.
- `buildChecklistRows()` lee template de BD con fallback a constantes.

**Archivos o módulos afectados:**

- `src/lib/constants.ts`
- `src/lib/checklist.ts`
- `src/components/forms/ChecklistGrid.tsx`
- `src/services/work-orders.service.ts`
- `src/lib/work-order/reception-print-data.ts`
- Futuro: settings + prisma model

**Dependencias:** Req #3 para print de nuevos ítems.

**Riesgos:**

- Recepciones antiguas no tendrán nuevos ítems hasta edición.
- Grid más largo afecta print (req #13).

**Checklist técnico:**

- [ ] Agregar 5 ítems nuevos con labels en español.
- [ ] Verificar persistencia en create/update recepción.
- [ ] Actualizar print checklist grid (columnas/paginación).
- [ ] Diseñar schema `ChecklistTemplateItem` (fase 2).
- [ ] Migración seed ítems BearJack.

**Criterios de aceptación:**

- [ ] Alfombras Tela y Goma son ítems separados checkables.
- [ ] Radar, Sensores y Cámara trasera aparecen en formulario y print.
- [ ] Fase 2: admin agrega ítems sin deploy (opcional).

**Estimación:** 1 día (ítems fijos); +1 semana (template configurable)

---

## 16. Condiciones legales

**Tipo:** Nueva Funcionalidad  
**Prioridad:** Alta  
**Complejidad:** L  

**Descripción técnica:**  
Sección “CONDICIONES LEGALES Y GARANTÍAS DEL SERVICIO” con 12 puntos, aceptación, nombre, fecha, firmas; versionado y evidencia de auditoría.

**Causa raíz probable:**  
No existe modelo de términos legales, aceptación ni bloque en print de recepción. Cotización tiene `termsNotes` / `warrantyNotes` en `WorkshopSettings` pero no es el documento legal completo ni trazabilidad de aceptación.

**Solución propuesta:**

**Modelo:**

```
LegalDocumentVersion (id, companyId, type RECEPTION, version, contentHtml,
                      effectiveFrom, isActive)
LegalAcceptance (id, workOrderReceptionId, legalVersionId, acceptedAt,
                 acceptedByName, customerSignatureUrl?, repSignatureUrl?,
                 ipAddress?, userAgent?)
```

**UI:**

- Bloque scrollable con 12 puntos antes de firmar (texto desde BD versionado).
- Checkbox “He leído y acepto…” obligatorio.
- Campos nombre cliente, fecha automática.
- Firma cliente (existente) + firma representante taller (nuevo pad o imagen stamp).

**Print:**

- Incluir texto legal completo o referencia versión + resumen.
- Firmas al pie.

**Admin:**

- Pantalla para editar/versionar texto (solo admin).
- No sobrescribir versiones anteriores (inmutabilidad).

**Archivos o módulos afectados:**

- Nuevo: `src/app/(app)/settings/legal/` o sección en settings
- `src/components/work-order/WorkOrderForm.tsx`
- `src/components/work-order/print/ReceptionOrderDocument.tsx`
- `src/services/work-orders.service.ts`
- `prisma/schema.prisma`
- Seed con 12 puntos del cliente

**Dependencias:** Req #2 (firma), #13 (espacio print), #6 (representante legal).

**Riesgos:**

- Texto legal debe ser validado por abogado del cliente — no inventar cláusulas.
- Versionado incorrecto puede invalidar evidencia en disputas.
- Documento muy largo empeora req #13.

**Checklist técnico:**

- [ ] Obtener texto exacto de los 12 puntos del cliente.
- [ ] Schema versionado + aceptación.
- [ ] UI aceptación obligatoria antes de submit.
- [ ] Segunda firma representante.
- [ ] Print con versión y timestamp.
- [ ] Auditoría inmutable (no UPDATE en versiones publicadas).
- [ ] Migración recepciones sin aceptación (grandfathering).

**Criterios de aceptación:**

- [ ] 12 puntos visibles antes de firmar en recepción.
- [ ] Cliente debe aceptar explícitamente para guardar.
- [ ] PDF incluye términos, nombre, fecha y ambas firmas.
- [ ] Sistema registra qué versión aceptó y cuándo.
- [ ] Admin puede publicar nueva versión sin borrar histórico.

**Estimación:** 1–2 semanas

---

# Roadmap recomendado

Orden de implementación priorizando bugs críticos, mejoras de recepción/print (valor inmediato al cliente) y luego módulos financieros grandes.

## Fase 0 — Hotfixes (Semana 1)

| Orden | ID | Tarea | Est. |
|-------|----|-------|------|
| 1 | **10** | Requisiciones grandes (`bodySizeLimit` + payload) | 1–2 días |
| 2 | **2** | Error firma (Storage + campo BD + QA print) | 1–2 días |
| 3 | **4** | Quitar notas internas del print | 2 h |
| 4 | **3** | Checks checklist visibles B/N | 4 h |
| 5 | **1** | Scroll al agregar líneas | 1 día |

**Entregable:** Operación diaria estable (requisiciones, firmas, documentos cliente correctos).

---

## Fase 1 — Recepción y documentos (Semanas 2–3)

| Orden | ID | Tarea | Est. |
|-------|----|-------|------|
| 6 | **5** | Fecha estimada de entrega | 1 día |
| 7 | **15** | Nuevos ítems checklist (+ extensibilidad básica) | 1–2 días |
| 8 | **6** | Config empresa + upload logo | 1–2 días |
| 9 | **13** | Auditoría CSS print (todos los documentos) | 1–2 sem |
| 10 | **16** | Condiciones legales + aceptación + firmas | 1–2 sem |

**Entregable:** Orden de recepción completa, legal y presentable al cliente.

---

## Fase 2 — Finanzas operativas (Semanas 4–6)

| Orden | ID | Tarea | Est. |
|-------|----|-------|------|
| 11 | **8** | Módulo gastos (MVP) | 2–3 sem |
| 12 | **11** | Caja chica (MVP) | 2–3 sem |
| 13 | **7** | Dashboard financiero (fase 1 sin gastos → fase 2 con gastos) | 3–5 días |

**Entregable:** Visibilidad costos, gastos y caja chica; dashboard con ingresos y margen.

**Nota:** #8 y #11 pueden solaparse parcialmente si se define el schema conjunto al inicio de fase 2.

---

## Fase 3 — Comunicación y experiencia avanzada (Semanas 7–9)

| Orden | ID | Tarea | Est. |
|-------|----|-------|------|
| 14 | **9** | Comunicación clientes (MVP wa.me/mailto → PDF) | 1–2 sem |
| 15 | **14** | Diagrama vehículo interactivo | 3–4 sem |

---

## Fase 4 — Tesorería avanzada (Semanas 10+)

| Orden | ID | Tarea | Est. |
|-------|----|-------|------|
| 16 | **12** | Módulo bancos (MVP) | 2–4 sem |

---

## Diagrama de dependencias

```
[Fase 0: 10, 2, 4, 3, 1]
        ↓
[Fase 1: 5, 15 → 13 → 16] ←── 6 (logo en print)
        ↓
[Fase 2: 8 ↔ 11 → 7]
        ↓
[Fase 3: 9, 14]
        ↓
[Fase 4: 12]
```

---

## Estimación global

| Fase | Duración estimada |
|------|-------------------|
| Fase 0 | ~1 semana |
| Fase 1 | ~2–3 semanas |
| Fase 2 | ~3–4 semanas |
| Fase 3 | ~3–4 semanas |
| Fase 4 | ~2–4 semanas |
| **Total** | **~11–16 semanas** (1 dev, sin contar validación legal/cliente) |

---

## Próximo paso recomendado

1. Validar este plan con AutoPaint BearJack (especialmente textos legales req #16 y definición de “ingreso” req #7).
2. Confirmar prioridad si algún ítem debe adelantarse (ej. diagrama vehículo vs caja chica).
3. Iniciar **Fase 0** sin desarrollar módulos nuevos hasta cerrar bugs críticos.

---

*Documento generado a partir del análisis del codebase Rapid (Next.js 16, Prisma, Supabase PostgreSQL + Storage).*
