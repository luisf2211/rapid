# Rapid Design System

Sistema de diseño para **Rapid** — plataforma operativa para talleres de pintura automotriz. Los tokens viven en `src/app/globals.css` y se consumen vía clases Tailwind (`bg-rapid-green`, `text-rapid-text-muted`, etc.) o variables CSS (`var(--rapid-green)`).

---

## Principios

- **Verde como acento único.** Un solo color de marca (`rapid-green`) concentra CTAs, estados positivos y acentos. El resto de la interfaz es neutra: blanco, grises y negro profundo.
- **Densidad operativa.** La app prioriza tablas, formularios y tarjetas de resumen sobre marketing editorial. Espaciado generoso en secciones, compacto dentro de datos.
- **Esquinas suaves.** Botones e inputs usan `rounded-lg` (8px). Tarjetas y paneles usan `rounded-[0.875rem]` (~14px) o `rounded-xl` / `rounded-2xl` en marketing.
- **Un solo nivel de elevación.** Sombras planas por defecto; una sombra flotante (`shadow-float`) para hover en tarjetas interactivas y dropdowns.
- **Accesibilidad base.** Botones de 48px de altura mínima, focus rings visibles, inputs con borde ink al enfocar (sin glow azul del navegador).

---

## Colores

### Marca

| Token CSS | Hex | Tailwind | Uso |
|---|---|---|---|
| `--rapid-black` | `#0b0f0e` | `rapid-black` | Marca oscura, botones dark, textos sobre fondos claros en landing |
| `--rapid-green` | `#00c853` | `rapid-green` | CTA primario, acentos, links de acción |
| `--rapid-green-dark` | `#009624` | `rapid-green-dark` | Hover de botón primario, montos, estados activos |
| `--rapid-green-soft` | `#d3f7e0` | `rapid-green-soft` | Fondos de badge positivo, highlights suaves |
| `--rapid-green-disabled` | `#a8edca` | `rapid-green-disabled` | Botón primario deshabilitado |

**Sidebar (variante oscura):** el panel lateral usa `#0c100f` — un negro ligeramente más claro que `--rapid-black`, con bordes `white/6%` y texto `white/50`–`white/70` para jerarquía.

**Gradiente dark:** `.surface-dark` y `.btn-dark:hover` usan `#1a201e` y `#1f2624` como tonos derivados del negro de marca.

### Canvas y superficies

| Token CSS | Hex | Tailwind | Uso |
|---|---|---|---|
| `--rapid-bg` | `#f5f7f6` | `rapid-bg` | Fondo general de la app |
| `--rapid-surface` | `#ffffff` | `rapid-surface` | Tarjetas, inputs, paneles blancos |
| `--rapid-surface-soft` | `#f7f7f7` | `rapid-surface-soft` | Hover secundario, campos deshabilitados |
| `--rapid-surface-strong` | `#f2f2f2` | `rapid-surface-strong` | Iconos en tarjetas, contadores, chips neutros |

### Texto

| Token CSS | Hex | Tailwind | Uso |
|---|---|---|---|
| `--rapid-text` | `#111827` | `rapid-text` | Títulos, texto principal, focus de inputs |
| `--rapid-text-body` | `#3d3d3d` | `rapid-text-body` | Cuerpo en bloques largos |
| `--rapid-text-muted` | `#6b7280` | `rapid-text-muted` | Subtítulos, labels, hints |
| `--rapid-text-muted-soft` | `#929292` | `rapid-text-muted-soft` | Placeholders deshabilitados, texto inactivo |

**Sobre fondos oscuros:** usar `text-white`, `text-white/70`, `.on-dark-muted` (`slate-300`) y `.on-dark-label` (`slate-400`).

### Bordes

| Token CSS | Hex | Tailwind | Uso |
|---|---|---|---|
| `--rapid-border` | `#e5e7eb` | `rapid-border` | Borde estándar de cards e inputs |
| `--rapid-hairline` | `#dddddd` | `rapid-hairline` | Divisores finos |
| `--rapid-border-strong` | `#c1c1c1` | `rapid-border-strong` | Bordes más marcados, inputs deshabilitados |

### Semánticos

| Token CSS | Valor | Tailwind | Uso |
|---|---|---|---|
| `--rapid-error` | `#c13515` | `rapid-error` | Texto de error, alertas destructivas |
| `--rapid-error-hover` | `#b32505` | — | Hover en links de error |
| `--rapid-scrim` | `rgba(0,0,0,0.5)` | — | Backdrop de modales |

**Alertas y estados (Tailwind estándar, no tokenizados):**

| Contexto | Fondo | Texto | Borde |
|---|---|---|---|
| Error / destructivo | `red-50` | `red-600`–`red-900` | `red-200` |
| Advertencia | `amber-50` | `amber-700`–`amber-900` | `amber-200` |
| Info / completado | `blue-50` | `blue-700` | `blue-200` |
| Éxito secundario | `emerald-50` | `emerald-700` | `emerald-200` |
| Neutro | `gray-50` | `gray-700` | `gray-200` |

Los badges de estado (`StatusBadge`, `QuotationStatusBadge`) mapean cada status a una de estas combinaciones. Estados positivos/aprobados usan tokens de marca (`rapid-green-soft` / `rapid-green-dark`).

---

## Tipografía

### Familias

| Rol | Fuente | Variable CSS | Tailwind |
|---|---|---|---|
| Sans (UI) | **Geist Sans** | `--font-geist-sans` | `font-sans` |
| Mono (códigos, montos) | **Geist Mono** | `--font-geist-mono` | `font-mono` |

Fallback: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`.

Configuradas en `src/app/layout.tsx`. Antialiasing activo en `html` y `body`.

### Escala tipográfica

| Token | Tamaño | Peso | Tracking | Uso |
|---|---|---|---|---|
| `display-xl` | 28px (`text-[28px]`) | 700 | tight | Título de página en desktop (`PageHeader`) |
| `display-lg` | 22px | 700 | tight | Título de página en mobile, valores en `SummaryCard` |
| `display-marketing` | 36–52px (`text-4xl`–`text-5xl`) | 700 | tight | Hero de landing |
| `section-title` | 30–36px (`text-3xl`–`text-4xl`) | 700 | tight | Secciones de landing |
| `body-md` | 16px (`text-base`) | 400–500 | normal | Texto por defecto, botones |
| `body-sm` | 14px (`text-sm`) | 400 | normal | Subtítulos, descripciones, tablas |
| `caption` | 11px (`text-[11px]`) | 600 | 0.05em uppercase | Labels de tarjeta, breadcrumb de página |
| `form-label` | 11px (`0.6875rem`) | 600 | 0.05em uppercase | `.form-label` sobre inputs |
| `form-input` | 15px (`0.9375rem`) | 400 | normal | Texto dentro de `.form-input` |
| `badge` | 12px (`text-xs`) | 600 | normal | Badges de estado |
| `micro` | 10px (`text-[10px]`) | 700 | normal | Contadores en tabs |

### Convenciones

- **Montos y números alineados:** usar `tabular-nums` en totales, precios y columnas numéricas.
- **Códigos de orden / slug:** usar `font-mono text-xs` (ej. `#WO-0042`).
- **Montos positivos / totales:** `text-rapid-green-dark font-bold tabular-nums`.
- **Títulos de página:** `PageHeader` — `text-[22px] sm:text-[28px] font-bold tracking-tight`.

---

## Espaciado

Base de **4px**. Tokens en `:root`:

| Token | Valor | Uso típico |
|---|---|---|
| `--space-xxs` | 2px | Micro-ajustes |
| `--space-xs` | 4px | Gaps mínimos |
| `--space-sm` | 8px | Padding interno compacto |
| `--space-md` | 12px | Gaps entre elementos relacionados |
| `--space-base` | 16px | Padding de card meta, gutters |
| `--space-lg` | 24px | Padding interno de cards, secciones |
| `--space-xl` | 32px | Separación entre bloques |
| `--space-xxl` | 48px | Bandas de sección |
| `--space-section` | 64px | Secciones de landing (`py-20 sm:py-24`) |

---

## Border radius

| Token | Valor | Uso |
|---|---|---|
| `rounded-lg` | 8px | Botones, inputs, tabs, chips pequeños |
| `rounded-xl` | 12px | Iconos en tarjetas, nav items, alertas |
| `rounded-[0.875rem]` | 14px | `.card`, `.surface-dark` |
| `rounded-2xl` | 16px | Paneles de marketing, bottom nav mobile |
| `rounded-full` | 9999px | Badges de estado, avatares, scrollbar |

---

## Elevación

### Sombra base de card

```css
box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
```

Aplicada en `.card`.

### Sombra flotante (`shadow-float`)

```css
--shadow-float:
  rgba(0, 0, 0, 0.02) 0 0 0 1px,
  rgba(0, 0, 0, 0.04) 0 2px 6px 0,
  rgba(0, 0, 0, 0.1) 0 4px 8px 0;
```

Usar en tarjetas interactivas al hover (`hover:shadow-float`) y paneles destacados en landing.

### Sin sombra

Fondo de app, tablas planas, sidebar — superficies definidas por color y borde, no por profundidad.

---

## Componentes

### Botones

Clases globales en `globals.css`. Altura mínima **48px** (`h-12`), `rounded-lg`, `font-medium`, `text-base`.

| Clase | Fondo | Texto | Hover | Focus ring |
|---|---|---|---|---|
| `.btn-primary` | `rapid-green` | blanco | `rapid-green-dark` | `ring-rapid-green` |
| `.btn-secondary` | `rapid-surface` | `rapid-text` | `rapid-surface-soft` | `ring-rapid-text/30` |
| `.btn-dark` | `rapid-black` | blanco | `#1f2624` | `ring-rapid-black/50` |

Estados deshabilitados: primario → `rapid-green-disabled`; secundario/dark → `opacity-50`.

### Formularios

| Clase | Descripción |
|---|---|
| `.form-label` | Caption uppercase sobre el campo |
| `.form-input` | Input base — borde `rapid-border`, radius 8px |
| `input.form-input`, `select.form-input` | Variante alta de **56px** (`h-14`) |

**Focus:** borde `rapid-text` + `box-shadow: inset 0 0 0 1px var(--rapid-text)` — sin ring externo.

**Disabled:** fondo `rapid-surface-soft`, texto `rapid-text-muted-soft`.

**Errores inline:** contenedor `border-rapid-error/25 bg-rapid-error/[0.06]` o combinación `red-50` / `red-600`.

### Tarjetas

| Clase | Descripción |
|---|---|
| `.card` | Superficie blanca, borde, radius 14px, sombra sutil |
| `.card-static` | Variante no interactiva (`pointer-events-none`) |

Padding habitual: `p-4`–`p-6`. Tarjetas de resumen: `card p-5`.

### Superficie oscura

| Clase | Descripción |
|---|---|
| `.surface-dark` | Gradiente `#0b0f0e` → `#1a201e`, texto blanco, radius 14px |
| `.on-dark-muted` | Texto secundario sobre dark (`slate-300`) |
| `.on-dark-label` | Labels sobre dark (`slate-400`) |

Usado en login (panel izquierdo), dashboard finance, landing header.

### Badges de estado

Patrón compartido:

```
inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold
```

Incluye un punto indicador (`w-1.5 h-1.5 rounded-full bg-current opacity-70`).

Componentes: `StatusBadge` (órdenes de trabajo), `QuotationStatusBadge` (cotizaciones).

### PageHeader

Encabezado estándar de páginas internas:

- Breadcrumb opcional: 11px uppercase muted
- Título: 22px mobile → 28px desktop, bold
- Subtítulo: 14px muted
- Acciones alineadas a la derecha

### SummaryCard

Tarjeta KPI con label uppercase, valor grande (`22px`–`26px` bold tabular), hint opcional e icono en contenedor `rounded-xl bg-rapid-surface-strong`.

---

## Layout

### App interna

- **Sidebar desktop:** 260px expandido / 76px contraído. Visible desde `lg` (1024px).
- **Mobile:** `MobileTopBar` + `MobileBottomNav`. Bottom nav con `rounded-2xl`, blur y sombra superior.
- **Contenedor de página:** padding horizontal `px-4 sm:px-6`, contenido fluido dentro del área principal.
- **Ancho máximo landing:** `max-w-6xl` (~1152px) centrado.

### Tablas

Patrón estándar dentro de `.card`:

- Header: `px-5 py-3 text-xs font-semibold uppercase text-rapid-text-muted`
- Celda: `px-5 py-3 text-sm`
- IDs / códigos: `font-mono text-xs`
- Montos: `text-right tabular-nums font-bold text-rapid-green-dark`

### Grids de dashboard

- KPIs: grid responsive `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`
- Módulos landing: `sm:grid-cols-2 lg:grid-cols-4`

---

## Responsive

Breakpoints Tailwind estándar:

| Nombre | Ancho | Cambios clave |
|---|---|---|
| Mobile | < 640px (`default`) | Nav inferior, sidebar oculto, títulos 22px |
| Tablet | ≥ 640px (`sm`) | Grids 2 columnas, padding mayor |
| Desktop | ≥ 1024px (`lg`) | Sidebar visible, grids 4 columnas, título 28px |
| Wide | ≥ 1280px (`xl`) | Contenido con más aire lateral |

### Touch targets

- Botones: mínimo 48×48px
- Icon buttons en sidebar/mobile: 36–40px con área de click generosa
- Bottom nav items: `py-2` con columna icono + label

---

## Focus y accesibilidad

- **Global:** `*:focus-visible` → `ring-2 ring-rapid-text/30 ring-offset-1`
- **Inputs:** sin ring; borde ink al focus (ver Formularios)
- **Botones:** ring específico por variante (verde, texto, negro)
- **Contraste:** texto principal `#111827` sobre `#ffffff` y `#f5f7f6` cumple WCAG AA
- **Scrollbar:** 6px, thumb `gray-300`, hover `gray-400`, `rounded-full`

---

## Iconografía

**Lucide React** para toda la UI. Tamaños habituales:

| Contexto | Tamaño |
|---|---|
| Sidebar / nav | `h-5 w-5` (20px), `strokeWidth={2}` |
| Tarjetas / KPI | `h-5 w-5` dentro de contenedor 40×40px |
| Botones inline | `h-4 w-4` |

---

## Referencia de implementación

| Recurso | Ubicación |
|---|---|
| Tokens CSS | `src/app/globals.css` |
| Fuentes | `src/app/layout.tsx` |
| Logo | `src/components/layout/Logo.tsx` |
| PageHeader | `src/components/ui/PageHeader.tsx` |
| SummaryCard | `src/components/ui/SummaryCard.tsx` |
| StatusBadge | `src/components/ui/StatusBadge.tsx` |
| QuotationStatusBadge | `src/components/ui/QuotationStatusBadge.tsx` |
| Sidebar | `src/components/layout/AppSidebar.tsx` |
| Landing | `src/components/landing/LandingPage.tsx` |

### Uso en código

```tsx
// Botón primario
<button type="button" className="btn-primary">Guardar</button>

// Input con label
<label className="form-label" htmlFor="name">Nombre</label>
<input id="name" className="form-input" />

// Tarjeta interactiva
<Link href="/orders" className="card p-5 hover:shadow-float transition-shadow">
  ...
</Link>

// Monto
<span className="text-2xl font-bold text-rapid-green-dark tabular-nums">
  RD$ 12,450.00
</span>
```

---

## Pendientes / gaps conocidos

- **Dark mode:** no implementado; la app es light-only en surfaces internas.
- **Tokens de alerta:** amber/red/blue usan paleta Tailwind directa; no están tokenizados en `:root`.
- **Sidebar bg:** `#0c100f` no está en tokens CSS — candidato a unificar como `--rapid-sidebar`.
- **Animaciones:** transiciones puntuales (`duration-150`, `duration-200`); sin sistema de motion documentado.
