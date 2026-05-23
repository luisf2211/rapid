# Rapid

**Sistema SaaS para talleres de pintura automotriz.** MVP operativo construido con Next.js (App Router), TypeScript, Tailwind CSS, Prisma y SQL Server.

Branding negro y verde. Diseño moderno, sobrio y orientado a talleres.

## Stack

- **Next.js 16** (App Router, Server Actions, Turbopack)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma 6** (ORM para SQL Server)
- **React Hook Form + Zod** (formularios y validación)
- **Lucide Icons**

## Flujo principal

```
Orden de recepción  →  Requisición de materiales  →  Mano de obra  →  Resumen financiero
```

## Módulos

- **Dashboard** — Totales de órdenes, materiales, mano de obra, últimas órdenes y estado general del taller.
- **Órdenes de recepción** (`/work-orders`) — Listado, creación y detalle con tabs: Recepción, Checklist, Daños, Fotos, Materiales, Mano de obra, Resumen financiero.
- **Requisición de materiales** (`/material-requisitions`) — Cabecera + tabla dinámica de productos con cálculo automático.
- **Mano de obra** (`/labor-orders`) — Cabecera + tabla dinámica por pieza desglosada en desabolladura, desarme, preparación, pintura y pulido.

## Estructura

```
src/
  app/
    (app)/                  # App shell (sidebar + main)
      dashboard/
      work-orders/
        new/
        [id]/               # Detalle con tabs
        actions.ts
      material-requisitions/
        new/
        actions.ts
      labor-orders/
        new/
        actions.ts
    layout.tsx
    page.tsx                # redirect → /dashboard
    globals.css
  components/
    layout/                 # Sidebar, MobileTopBar, MobileBottomNav, Logo
    forms/                  # TextInput, SelectInput, MoneyInput, TextAreaInput, ChecklistGrid
    ui/                     # PageHeader, StatusBadge, SummaryCard
  lib/
    prisma.ts               # Cliente Prisma (singleton)
    constants.ts            # Checklists, materiales sugeridos, piezas...
    utils.ts                # cn() (clsx + tailwind-merge)
    formatters/             # money.ts, date.ts
    validations/            # work-order, material-requisition, labor-order (Zod)
  services/
    work-orders.service.ts
    material-requisitions.service.ts
    labor-orders.service.ts
prisma/
  schema.prisma             # SQL Server
```

## Modelos Prisma

- `WorkOrder` (orden principal)
- `WorkOrderReception` (1:1)
- `WorkOrderReceptionChecklist` (1:1, 26 booleans)
- `WorkOrderPhoto` (1:N)
- `WorkOrderDamage` (1:N, con lado, tipo, descripción, posición XY)
- `MaterialRequisition` + `MaterialRequisitionItem` (cabecera/detalle)
- `LaborOrder` + `LaborOrderItem` (cabecera/detalle con costos por área)

Todos los IDs son `UniqueIdentifier` (UUID) compatibles con SQL Server.

## Configuración

### 1. Variables de entorno

El archivo `.env` ya viene preconfigurado para SQL Server local:

```env
DATABASE_URL="sqlserver://localhost:1433;database=Rapid;user=sa;password=TuPasswordSuperSegura123!;trustServerCertificate=true"
```

Edítalo si tu instancia local usa otras credenciales.

### 2. Base de datos

La base de datos `Rapid` debe existir en tu SQL Server local. Para sincronizar el esquema con Prisma:

```bash
npm run prisma:push      # Aplica el schema a SQL Server (crea/actualiza tablas)
npm run prisma:generate  # Regenera el cliente Prisma
npm run prisma:studio    # Abre Prisma Studio para inspeccionar datos
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). La raíz redirige a `/dashboard`.

### 5. Producción

```bash
npm run build
npm run start
```

## Diseño

Paleta:

| Color                | Hex      | Uso                                 |
| -------------------- | -------- | ----------------------------------- |
| Negro principal      | `#0B0F0E`| Sidebar, botones primarios oscuros  |
| Verde principal      | `#00C853`| Acentos, CTAs, estados activos      |
| Verde oscuro         | `#009624`| Hover, totales financieros          |
| Verde suave          | `#D3F7E0`| Fondos de badges y selecciones      |
| Gris fondo           | `#F5F7F6`| Fondo general                       |
| Blanco               | `#FFFFFF`| Superficies (cards, inputs)         |
| Texto principal      | `#111827`| Texto principal                     |

Componentes con bordes suaves (`rounded-xl`), sombras ligeras y acentos verde/neón.

## Capacidades del MVP

- Crear una orden de recepción completa (cliente, vehículo, recepción, checklist de 26 items, daños y fotos)
- Listar y filtrar órdenes por estado/búsqueda
- Ver detalle con 7 tabs (incluyendo resumen financiero)
- Cambiar estado de la orden
- Crear requisiciones de materiales con autocompletado y totales automáticos
- Crear órdenes de mano de obra con costos desglosados por área
- Calcular totales por orden, por requisición y total general

## Fuera del MVP

- Autenticación
- Multi-empresa
- Facturación
- Inventario

## Comandos

| Comando                   | Descripción                              |
| ------------------------- | ---------------------------------------- |
| `npm run dev`             | Servidor de desarrollo (Turbopack)       |
| `npm run build`           | Build de producción                       |
| `npm run start`           | Servidor de producción                   |
| `npm run prisma:push`     | Aplica el schema a la base de datos      |
| `npm run prisma:generate` | Regenera el cliente Prisma               |
| `npm run prisma:studio`   | Abre Prisma Studio                       |
