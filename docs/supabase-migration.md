# Migración a Supabase (PostgreSQL)

Guía para migrar **Rapid** de SQL Server a **Supabase** con **una sola ejecución** que crea todas las tablas, índices y relaciones del schema actual.

No hace falta correr los 19 scripts T-SQL de `scripts/sql/` uno por uno: el schema completo vive en `prisma/schema.postgresql.prisma` y Prisma lo aplica de una vez.

---

## Qué incluye la migración

| Módulo | Tablas |
|--------|--------|
| Auth multi-empresa | `Company`, `User` |
| Órdenes de trabajo | `WorkOrder`, recepción, checklist, daños, fotos |
| Inventario | `InventoryPart`, `InventoryMovement` |
| Requisiciones / mano de obra | `MaterialRequisition*`, `LaborOrder*` |
| Cotizaciones | `Quotation` + líneas, daños, fotos |
| Facturación | `Invoice`, `InvoiceLine` |
| Taller | `WorkshopSettings`, `AuditLog` |
| Nómina | `Employee`, pagos, períodos, liquidaciones |

**Total:** 28 modelos Prisma → 28 tablas en PostgreSQL.

**Fuera de alcance (por ahora):** auth Supabase Auth, Storage para fotos, migración de datos desde SQL Server existente.

---

## Requisitos previos

1. Cuenta en [supabase.com](https://supabase.com).
2. Proyecto Supabase creado (región cercana a tus usuarios).
3. Node.js y dependencias del repo instaladas (`npm install`).
4. Base **vacía** en Supabase (proyecto nuevo) o aceptar `--accept-data-loss` si re-aplicas el schema.

---

## Paso 1 — Crear proyecto en Supabase

1. Dashboard → **New project**.
2. Anota la **contraseña** del usuario `postgres`.
3. Espera a que el proyecto termine de aprovisionarse.

---

## Paso 2 — Obtener la connection string

En Supabase: **Project Settings → Database → Connection string**.

Usa el modo **URI** y el host **Direct connection** (puerto **5432**).  
`prisma db push` necesita conexión directa, no el pooler en modo transaction (6543).

Ejemplo:

```env
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
```

### Variables recomendadas en `.env`

```env
# Supabase — conexión directa (migración + Prisma en dev)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# App (sin cambios)
AUTH_SECRET="genera-un-secreto-largo-y-aleatorio"
UPLOADS_DIR="./uploads"
PLATFORM_ADMIN_EMAIL="admin@rapid.local"
PLATFORM_ADMIN_PASSWORD="123"
```

### Producción (Vercel / serverless)

Cuando despliegues, puedes usar el **pooler** en puerto **6543** con `?pgbouncer=true` para la app en runtime. La migración inicial sigue haciéndose con la URL directa (5432).

Opcional en `schema.prisma` para producción con migrate:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Paso 3 — Migración única (crea todas las tablas)

Un solo comando aplica el schema PostgreSQL, regenera Prisma Client y crea el usuario admin.

```bash
npm run supabase:migrate
```

Equivalente manual:

```bash
node scripts/migrate-to-supabase.mjs
```

### Qué hace internamente

| Orden | Acción |
|-------|--------|
| 1 | Respalda `prisma/schema.prisma` en `prisma/schema.sqlserver.prisma` (solo la primera vez) |
| 2 | Copia `prisma/schema.postgresql.prisma` → `prisma/schema.prisma` |
| 3 | `npx prisma db push --accept-data-loss` — crea/actualiza **todas** las tablas en Supabase |
| 4 | `npx prisma generate` |
| 5 | `node scripts/supabase-seed.mjs` — usuario `admin@rapid.local` |

### Credenciales iniciales

| Campo | Valor |
|-------|--------|
| Usuario | `admin` o `admin@rapid.local` |
| Contraseña | `123` (o `PLATFORM_ADMIN_PASSWORD` en `.env`) |

Cambia la contraseña en producción.

---

## Paso 4 — Verificar

```bash
# Inspeccionar datos
npm run prisma:studio

# Arrancar la app
npm run dev
```

Checklist:

- [ ] Login con admin funciona → `/admin`
- [ ] Crear empresa desde admin
- [ ] Crear orden de trabajo
- [ ] Subir foto (sigue usando disco local `UPLOADS_DIR`)
- [ ] Cotización e inventario

En Supabase Dashboard → **Table Editor** deberías ver las 28 tablas con nombres PascalCase (`Company`, `WorkOrder`, etc.), igual que en SQL Server.

---

## Alternativa: solo SQL en el editor de Supabase

Si prefieres no usar Prisma en el paso de creación (no recomendado para mantener paridad), el flujo oficial del repo es **Prisma db push**. Los scripts `scripts/sql/*.sql` son históricos de SQL Server y **no** se ejecutan en Supabase.

---

## Migrar datos desde SQL Server (opcional)

Si ya tienes datos en SQL Server y quieres conservarlos:

1. Exportar tablas a CSV o usar una herramienta ETL (pgLoader, DBeaver, etc.).
2. Ajustar tipos (`BIT` → boolean, `DATETIME2` → timestamptz, etc.).
3. Respetar el orden de FKs (Company → User → WorkOrder → …).
4. Ejecutar **después** de `npm run supabase:migrate`.

Para entorno nuevo / demo, basta con el seed del admin.

---

## Cambios de código pendientes (post-migración)

La base queda lista con un comando; estos ajustes menores mejoran compatibilidad con PostgreSQL:

| Archivo | Cambio |
|---------|--------|
| `scripts/clean-database.mjs` | Reemplazar SQL T-SQL (`dbo.`, `DELETE FROM`) por operaciones Prisma o SQL PostgreSQL |
| `src/services/work-orders.service.ts` | Revisar lectura de campos `@db.Time` (PostgreSQL devuelve `Date` distinto a SQL Server) |
| `README.md` | Actualizar stack a PostgreSQL / Supabase |

Auth (JWT + bcrypt), uploads locales y Server Actions **siguen igual** — no se usa Supabase Auth ni Storage en esta migración.

---

## Rollback a SQL Server

Si guardaste el respaldo:

```bash
cp prisma/schema.sqlserver.prisma prisma/schema.prisma
# Restaurar DATABASE_URL de SQL Server en .env
npm run prisma:generate
npm run prisma:push
```

---

## Solución de problemas

### `DATABASE_URL debe ser PostgreSQL`

La variable sigue apuntando a SQL Server. Actualiza `.env` con la URI de Supabase (debe empezar con `postgresql://`).

### `Can't reach database server`

- Verifica contraseña y `[PROJECT-REF]`.
- Usa puerto **5432** (direct), no 6543, para `db push`.
- En Supabase: Settings → Database → revisa si IP allowlist bloquea tu conexión (en dev suele estar abierto).

### `P2002` / unique constraint al hacer seed

El admin ya existe. Normal si ejecutas el seed dos veces.

### Nombres de tablas con mayúsculas

Prisma mapea `@@map("Company")`. PostgreSQL crea tablas quoted `"Company"`. No renombres a snake_case sin actualizar el schema.

### Error de `@db.Time` en recepción

Si algún campo hora falla al guardar/leer, convierte a `String` en el schema o normaliza en el servicio (ver comentarios en `work-orders.service.ts`).

---

## Resumen de archivos

| Archivo | Propósito |
|---------|-----------|
| `docs/supabase-migration.md` | Esta guía |
| `prisma/schema.postgresql.prisma` | Schema completo PostgreSQL (fuente de verdad) |
| `prisma/schema.sqlserver.prisma` | Respaldo automático del schema SQL Server |
| `scripts/migrate-to-supabase.mjs` | Migración única |
| `scripts/supabase-seed.mjs` | Usuario admin inicial |

---

## Comando rápido

```bash
# 1. Configura DATABASE_URL en .env (Supabase, puerto 5432)
# 2. Ejecuta:
npm run supabase:migrate
# 3. Desarrollo:
npm run dev
```

Con eso las tablas quedan creadas en Supabase con la misma estructura funcional que el schema actual de Rapid.
