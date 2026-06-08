# SDD — Software Design Document
## AgroMaint Pro · v1.0
### IMECOL S.A.S. — Sistema de Gestión de Mantenimiento de Maquinaria Agrícola

**Documento:** SDD-AGROMAINT-001  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** En desarrollo activo  
**Clasificación:** Confidencial — IMECOL S.A.S.

---

## 1. Resumen Ejecutivo

AgroMaint Pro es un sistema SaaS multiplataforma para la gestión integral del mantenimiento de maquinaria agrícola, desarrollado para **IMECOL S.A.S.**, distribuidor oficial de CASE IH en Colombia. El sistema centraliza la planeación, ejecución, documentación, análisis y optimización del mantenimiento preventivo, correctivo, predictivo y basado en condición de la flota agrícola de sus clientes.

El software sirve a un ecosistema de usuarios que incluye administradores de IMECOL, técnicos de campo, clientes propietarios de maquinaria (ingenios azucareros y palmicultores), coordinadores de mantenimiento y gerentes de servicio.

---

## 2. Contexto de Negocio

| Campo | Detalle |
|-------|---------|
| **Cliente** | IMECOL S.A.S. |
| **Sector** | Distribución y posventa de maquinaria agrícola CASE IH |
| **Usuarios objetivo** | Administradores, técnicos de campo, clientes, gerentes |
| **Equipos objetivo** | Cosechadoras A9900, tractores, sembradoras, pulverizadoras |
| **Mercado inicial** | Ingenios azucareros y palmicultores de Colombia |
| **Plataforma** | Web responsive + PWA móvil |
| **Modelo de negocio** | SaaS multiempresa |

### 2.1 Tipos de Cliente Soportados
- **13 Ingenios Azucareros**: Providencia, Manuelita, Risaralda, La Cabaña, Pichichi, Incauca, Carmelita, Castilla, Mayagüez, San Carlos, Riopaila Castilla, Central Tumaco, Ingenio del Cauca
- **37+ Palmicultores**: Palmeras de la Costa, Oleoflores, Indupalma, Unipalma, Bio D, y otros cultivadores del Meta, César, Santander, Nariño y Córdoba

---

## 3. Arquitectura del Sistema

### 3.1 Visión General

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser/PWA)                     │
│  React 19 · Next.js 15 App Router · Tailwind CSS · Recharts     │
└─────────────────────────────┬───────────────────────────────────┘
                              │ HTTPS
┌─────────────────────────────▼───────────────────────────────────┐
│                      NEXT.JS SERVER                              │
│  App Router · Server Actions · API Routes · Middleware Auth      │
│  NextAuth.js 5 (JWT strategy)                                    │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                       PRISMA ORM                                 │
│  Type-safe DB client · Migrations · Soft delete                 │
└─────────────────────────────┬───────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────┐
│                    BASE DE DATOS (SQLite → PostgreSQL)           │
│  Multi-tenant por organizationId · Índices optimizados          │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Patrón Arquitectónico

**Next.js App Router con Server Actions**

- Las páginas son **React Server Components (RSC)** por defecto — consultan la BD directamente sin capa de API explícita
- Las mutaciones se realizan mediante **Server Actions** (`'use server'`) definidas en cada módulo
- Los componentes interactivos (gráficas, Gantt, filtros) son **Client Components** (`'use client'`)
- El estado global de UI se maneja con **Zustand** en el cliente
- Los datos para los dashboards se serializan en el servidor y se pasan como props al cliente

### 3.3 Estructura de Carpetas

```
agromaint-pro/
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Rutas de autenticación (login)
│   │   └── login/
│   ├── (app)/                    # Rutas protegidas (requieren sesión)
│   │   ├── layout.tsx            # Layout con AppShell
│   │   ├── dashboard/            # M01 Dashboard gerencial
│   │   ├── activos/              # M02 Gestión de activos/flota
│   │   ├── ordenes/              # M04 Órdenes de trabajo
│   │   ├── proyectos/            # M04b Proyectos con Gantt
│   │   ├── planes/               # M05 Planes de mantenimiento
│   │   ├── clientes/             # M06 Gestión de clientes
│   │   ├── tecnicos/             # M07 Técnicos y agenda
│   │   ├── solicitudes/          # M09 Solicitudes de servicio
│   │   └── configuracion/        # M16 Configuración
│   ├── globals.css               # Design tokens, utilidades CSS
│   └── layout.tsx                # Root layout (fuentes, metadata)
│
├── @core/                        # Núcleo compartido
│   ├── components/
│   │   ├── layout/               # AppShell, SideNavigation, TopNavigation
│   │   ├── shared/               # PageComponents, DataTable
│   │   └── ui/                   # Badge, Button, Card, Input
│   ├── lib/
│   │   ├── db.ts                 # Singleton PrismaClient
│   │   ├── utils.ts              # Helpers (format, generate, etc.)
│   │   └── auth.ts               # NextAuth configuration
│   ├── types/index.ts            # TypeScript interfaces y tipos
│   └── constants/index.ts        # Enums, opciones de dropdowns
│
├── modules/                      # Lógica de negocio por dominio
│   ├── M01_auth/                 # Autenticación y validaciones
│   ├── M02_dashboard/            # KPIs y datos de dashboard
│   ├── M03_assets/               # Activos/equipos
│   ├── M04_work_orders/          # Órdenes de trabajo y proyectos
│   ├── M05_maintenance_plans/    # Planes preventivos
│   ├── M06_clients/              # Gestión de clientes
│   ├── M07_technicians/          # Técnicos
│   └── M10_service_requests/     # Solicitudes de servicio
│
├── prisma/
│   ├── schema.prisma             # Esquema de base de datos
│   └── seed.ts                   # Datos de demostración
│
└── docs/                         # Documentación técnica
    ├── SDD.md                    # Este documento
    └── MCP.md                    # Master Control Plan
```

---

## 4. Stack Tecnológico

### 4.1 Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js | 15.0.4 | Framework full-stack con App Router |
| React | 19.0.0 | UI library |
| TypeScript | 5 | Tipado estático |
| Tailwind CSS | 3.4.17 | Utilidades CSS + design system |
| Recharts | 2.13.3 | Gráficas interactivas tipo PowerBI |
| Lucide React | 0.468.0 | Iconografía |
| Zustand | 5.0.2 | State management global |
| React Hook Form | 7.54.2 | Manejo de formularios |
| Zod | 3.24.1 | Validación de esquemas |
| date-fns | 4.1.0 | Manipulación de fechas |
| TanStack Table | 8.20.6 | Tablas con sorting/filtering |
| TanStack Query | 5.62.16 | Data fetching en cliente |

### 4.2 Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Next.js Server Actions | 15 | Mutaciones del servidor |
| NextAuth.js | 5.0.0-beta | Autenticación JWT |
| Prisma ORM | 6.1.0 | Acceso a base de datos |
| bcryptjs | 2.4.3 | Hash de contraseñas |
| jose | 5.9.6 | JWT firmado |

### 4.3 Base de Datos

| Entorno | Motor | Notas |
|---------|-------|-------|
| Desarrollo | SQLite | `file:./dev.db` |
| Producción | PostgreSQL | Migración directa con Prisma |

### 4.4 Utilidades

| Librería | Propósito |
|----------|-----------|
| ExcelJS | Exportación e importación Excel |
| jsPDF + AutoTable | Generación de reportes PDF |
| QRCode | Generación de códigos QR por activo |
| UUID | Generación de identificadores únicos |

---

## 5. Modelo de Datos

### 5.1 Diagrama de Entidades Principales

```
Organization (multi-tenant root)
    │
    ├── User ──────────── UserRole ─── Role
    │       └── Session
    │
    ├── Client ─── ClientSite
    │       └── Asset ──────────── AssetAttachment
    │               │              HourReading
    │               │              QrCode
    │               │
    │               └── WorkOrder ─── WorkOrderTask ─── WorkOrderSubtask
    │                       │                 └── Technician
    │                       ├── WorkOrderComment
    │                       ├── WorkOrderAttachment
    │                       ├── WorkOrderPart
    │                       ├── WorkOrderStatusHistory
    │                       ├── Inspection ─── InspectionAnswer
    │                       │                   └── InspectionFinding
    │                       ├── Warranty ─── WarrantyClaim
    │                       └── Signature
    │
    ├── MaintenancePlan ─── MaintenancePlanTask
    │           └── MaintenancePlanAsset ─── Asset
    │
    ├── Part ─── InventoryMovement
    │       └── PartAssetCompatibility ─── AssetModel
    │
    ├── Technician ─── User
    │
    ├── ServiceRequest ─── WorkOrder
    │
    └── Document ─── DocumentChunk
```

### 5.2 Convenciones de Base de Datos

| Convención | Valor |
|------------|-------|
| ID | `cuid()` (collision-resistant unique id) |
| Timestamps | `createdAt`, `updatedAt` en todas las entidades |
| Soft delete | `deletedAt: DateTime?`, `isActive: Boolean @default(true)` |
| Multi-tenant | `organizationId: String` en todas las entidades raíz |
| JSON fields | Arrays como `specialty`, `courses`, `certifications` almacenados como `String` (JSON serializado) |

### 5.3 Formatos de Números de Referencia

| Entidad | Formato | Ejemplo |
|---------|---------|---------|
| Orden de Trabajo | `OT-YYMMDD-XXXX` | `OT-260607-1234` |
| Proyecto | `PRJ-CORR-XXX` | `PRJ-CORR-001` |
| Cliente | `CLI-XXXX` | `CLI-0001` |
| Técnico | `TECH-XXX` | `TECH-001` |
| Solicitud de Servicio | `SR-XXXXXX` | `SR-123456` |
| Activo | `EQ-XXX` | `EQ-001` |

---

## 6. Módulos del Sistema

### M01 — Dashboard Gerencial

**Archivo:** `app/(app)/dashboard/`  
**Propósito:** Panel analítico en tiempo real con indicadores KPI e interactividad tipo PowerBI.

**Características:**
- 3 perspectivas: General Compañía / Por Cliente / Por Técnico
- Cross-filtering: clic en cualquier gráfico filtra todos los demás
- 6 gráficos simultáneos: donut tipos, barras retrasos, donut prioridades, área tendencia 6M, equipos críticos, distribución estados
- KPIs interactivos que actúan como filtros
- Línea temporal "HOY" en diagramas de Gantt

**Datos cargados (server):** Todas las órdenes con asset, client, assignedTo, actualHours, costos, fechas.

---

### M02 — Gestión de Activos / Flota

**Archivo:** `app/(app)/activos/`, `modules/M03_assets/`  
**Propósito:** Expediente digital completo de cada equipo.

**Campos clave:** internalCode, serialNumber, marca, modelo, año, cliente, horómetro actual, próximo mantenimiento, estado operativo, criticidad, ubicación GPS.

**Estados de activo:** Operativo · En Mantenimiento · Fuera de Servicio · En Garantía · En Diagnóstico · Dado de baja

**Funcionalidades:**
- Tabla con indicadores de urgencia por horómetro (rojo < 100h, ámbar < 250h)
- Filtros por código, serial, cliente
- Enlace directo a crear nueva OT desde el activo

---

### M04 — Órdenes de Trabajo

**Archivo:** `app/(app)/ordenes/`, `modules/M04_work_orders/`  
**Propósito:** Módulo central. Gestión del ciclo completo de vida de una OT.

**13 Tipos de Orden:**
`preventive` · `corrective` · `inspection` · `predictive` · `warranty` · `emergency` · `campaign` · `predelivery` · `seasonal_pre` · `seasonal_post` · `daily_operator` · `lubricación` · `diagnosis`

**16 Estados:**
`new` → `requested` → `approved` → `scheduled` → `assigned` → `en_route` → `in_progress` → `paused` → `pending_parts` → `pending_approval` → `pending_client` → `completed_by_tech` → `in_review` → `closed` / `cancelled` / `reopened`

**6 Prioridades:** `low` · `medium` · `high` · `critical` · `stopped` · `safety`

**Campos de costo:** `laborCost`, `partsCost`, `externalCost`, `totalCost`

---

### M04b — Proyectos (Reparaciones Mayores)

**Archivo:** `app/(app)/proyectos/`, componentes `InteractiveGantt.tsx`, `ActivitiesManager.tsx`  
**Propósito:** Gestión visual de reparaciones mayores con cronograma Gantt interactivo.

**Diagrama de Gantt:**
- Vista días / semanas con zoom
- Barras de colores semánticos: verde (completado), azul (en progreso), rojo (retrasado), naranja (pausado), gris (pendiente)
- Línea "HOY" vertical en azul con etiqueta
- Overlay de progreso (0-100%) sobre cada barra
- Subtareas expandibles con toggle de completado
- Modal de edición inline por actividad
- Modo pantalla completa

**ActivitiesManager:**
- Agrupación por Sistema → Componente
- 10 sistemas de color: Motor (rojo), Hidráulico (azul), Transmisión (violeta), Eléctrico (ámbar), Corte (verde), etc.
- Barra de progreso del sistema en cada header colapsable

---

### M05 — Planes de Mantenimiento Preventivo

**Archivo:** `app/(app)/planes/`, `modules/M05_maintenance_plans/`  
**Propósito:** Definición y gestión de planes preventivos según fabricante.

**Plan CASE IH A9900 cargado (datos oficiales del fabricante):**
- 10 horas: inspección niveles, pre-filtro aire, hidráulico
- 50 horas: engrase, tensión correas, filtro cabina
- 250 horas: cambio aceite motor Shell Rimula R4 15W-40 (30L), filtros, frenos, radiador
- 500 horas: aceite transmisión Shell Spirax S4 ATF HDX (42L), diferencial, hidráulico retorno, válvulas, eléctrico
- 1000 horas: sistema hidráulico completo, refrigerante Shell Glycoshell AF-37, inyectores
- 2000 horas: overhaul sistema cosecha, reductores de ruedas, calibración AFS

---

### M06 — Gestión de Clientes

**Archivo:** `app/(app)/clientes/`, `modules/M06_clients/`  
**Propósito:** CRM básico de clientes agropecuarios.

**Segmentación visual:**
- **Ingenios Azucareros** (avatar ámbar/naranja): Providencia, Manuelita, Risaralda, La Cabaña, Pichichi, Incauca, Carmelita, Castilla, Mayagüez, San Carlos, Riopaila Castilla, Central Tumaco, Ingenio del Cauca
- **Palmicultores** (avatar verde/teal): 37 empresas en Meta, César, Santander, Nariño, Córdoba, Bolívar, Casanare, Arauca y Cundinamarca

**Vista:** Grupos separados con encabezado visual · Card con nombre, badge de tipo, ciudad/departamento, contacto, teléfono, barra de equipos operativos.

---

### M07 — Técnicos y Agenda

**Archivo:** `app/(app)/tecnicos/`, `modules/M07_technicians/`  
**Propósito:** Gestión del equipo de técnicos de campo y de taller.

**Niveles:** junior · mid · senior · specialist

**Campos JSON:** specialty[], courses[], certifications[] (almacenados como JSON string en BD)

**Datos del equipo actual (20 técnicos):**
- 3 Specialists: Juan Carlos Montoya (Cosechadoras), Luis Fernando Castro (Agricultura de Precisión), Álvaro León Ramírez (Diagnóstico)
- 6 Senior: Andrés Felipe Gómez, José Luis Herrera, Jorge Mario Gutiérrez, Rodrigo Hernán Muñoz, Mauricio de Jesús Cardona, William Alberto Ocampo, Víctor Manuel Piedrahita
- 7 Mid: Carlos Alberto Rodríguez, Francisco Javier Ospina, Harold Yesid Valencia, Wilson Alexander Agudelo, Gabriel Jaime Restrepo, Hernán Darío Jaramillo, Nelson Enrique Salazar
- 4 Junior: Diego Alejandro Martínez, Gustavo Adolfo Ortiz, Oscar Mario Zapata, un técnico adicional

---

### M09 — Solicitudes de Servicio

**Archivo:** `app/(app)/solicitudes/`, `modules/M10_service_requests/`  
**Propósito:** Canal de entrada de solicitudes desde clientes y operadores.

**Campos:** cliente, equipo, título, descripción, urgencia, síntoma, horómetro, equipo detenido (sí/no), seguridad comprometida (sí/no), fecha deseada.

**Flujo:** Solicitud → Aprobación → Conversión a Orden de Trabajo.

---

## 7. Sistema de Autenticación y Seguridad

### 7.1 Flujo de Autenticación

```
Usuario → Login Form → NextAuth Credentials Provider
       → bcrypt.compare(password, hash)
       → JWT firmado (jose)
       → Session (userId, email, name, role)
       → Middleware verifica JWT en rutas protegidas
```

### 7.2 Middleware de Protección

`middleware.ts` protege todas las rutas bajo `/(app)/`. Si no hay sesión válida, redirige a `/login`.

### 7.3 Credenciales de Demo

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@imecol.com.co` | `AgroMaint2024!` |
| Supervisor | `supervisor@imecol.com.co` | `AgroMaint2024!` |
| Técnico 1 | `tecnico1@imecol.com.co` | `AgroMaint2024!` |

### 7.4 Medidas de Seguridad

- Contraseñas hasheadas con **bcrypt (salt rounds: 12)**
- Tokens JWT firmados con `jose`
- Validación de formularios con **Zod** en cliente y servidor
- Server Actions ejecutadas en servidor — no expone lógica al cliente
- Soft delete en lugar de eliminación física

---

## 8. Design System

### 8.1 Paleta de Colores

| Token | Valor | Uso |
|-------|-------|-----|
| `brand-600` | `#0052cc` | Color primario, botones, links activos |
| `brand-950` | `#0f1c2e` | Fondo sidebar (navy oscuro) |
| `emerald-500` | `#10b981` | Estado completado, operativo |
| `amber-500` | `#f59e0b` | Estado advertencia, en progreso |
| `rose-500` | `#f43f5e` | Estado crítico, retrasado, error |
| `violet-500` | `#8b5cf6` | Prioridad alta, especialista |
| `slate-100` | `#f1f5f9` | Fondos de tabla, grid background |

### 8.2 Clases CSS Personalizadas (globals.css)

| Clase | Descripción |
|-------|-------------|
| `.kpi-card` | Tarjeta KPI con hover lift y borde activo |
| `.chart-card` | Contenedor de gráficas con sombra |
| `.data-table` | Tabla con estilos de filas y headers |
| `.filter-chip` | Chip de filtro activo/inactivo |
| `.status-pill` | Badge de estado con dot de color |
| `.nav-item` | Item de navegación lateral |
| `.gradient-brand` | Gradiente azul corporativo |
| `.animate-fade-in` | Animación de entrada (fadeSlideIn) |

### 8.3 Comportamiento de Gráficas (PowerBI-style)

- **Hover en barras**: solo la barra coloreada cambia (`brightness(1.15)`), fondo sin efecto (`cursor={false}` en Tooltip)
- **Hover en donuts**: solo el segmento coloreado escala (`scale(1.04)`) + brilla, el `activeShape` de Recharts está desactivado (`activeShape={undefined}`)
- **Cross-filtering**: clic en cualquier elemento de gráfica actualiza todos los demás vía estado de React (`useState` + `useMemo`)
- **`<Cell>` en barras agrupadas**: requiere `fill` explícito en cada Cell para que las barras no queden transparentes en Recharts

---

## 9. Componentes Clave

### 9.1 InteractiveDashboard

**Archivo:** `app/(app)/dashboard/_components/InteractiveDashboard.tsx`  
**Tipo:** Client Component

Orquesta el dashboard completo. Mantiene el estado de filtros activos (`selectedType`, `selectedTech`, `delayedOnly`, `activeOnly`) y los pasa a los sub-componentes de gráficas. Usa `useMemo` para recalcular métricas en cada cambio de filtro sin re-fetch de BD.

### 9.2 InteractiveGantt

**Archivo:** `app/(app)/proyectos/[id]/_components/InteractiveGantt.tsx`  
**Tipo:** Client Component

Implementa el diagrama de Gantt desde cero con React. Calcula posiciones de barras en píxeles a partir de `dayWidth × offsetDays`. Incluye:
- Modo días (42px/día) y semanas (12px/día)
- Línea "HOY" calculada como `differenceInDays(new Date(), chartStart) × dayWidth`
- Actualización optimista de estado local + Server Action en paralelo
- Modalidad pantalla completa con fondo blur

### 9.3 DashboardCharts

**Archivo:** `app/(app)/dashboard/_components/DashboardCharts.tsx`  
**Tipo:** Client Component

6 gráficas en layout 3+3 columnas. Cada una usa un componente `PowerBIDonut` o `PowerBIBar` interno que gestiona el hover localmente con `useState<number | null>` y aplica los estilos solo sobre el elemento SVG correspondiente.

---

## 10. API — Server Actions

Todas las mutaciones usan el patrón `'use server'` de Next.js. No existe una API REST separada.

### Patrón de Server Action

```typescript
'use server'
import { db } from '@core/lib/db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createEntity(formData: FormData) {
  // 1. Validar con Zod (opcional)
  // 2. Extraer campos del FormData
  // 3. Persistir en BD con Prisma
  const entity = await db.entity.create({ data: { ... } })
  // 4. Invalidar caché de la ruta
  revalidatePath('/ruta')
  // 5. Redirigir al detalle
  redirect(`/ruta/${entity.id}`)
}
```

### Inventario de Actions por Módulo

| Módulo | Actions Disponibles |
|--------|---------------------|
| M03 Assets | `getAssets`, `getAssetById`, `createAsset` |
| M04 WorkOrders | `getWorkOrders`, `getWorkOrderById`, `createWorkOrder`, `updateWorkOrderStatus`, `createProjectActivity`, `createProjectSubtask`, `toggleProjectSubtask`, `updateTaskProgress`, `updateTaskDetails`, `getAssetsClientsTechnicians` |
| M05 Plans | `getMaintenancePlans`, `getPlanById`, `createMaintenancePlan` |
| M06 Clients | `getClients`, `getClientById`, `createClient`, `updateClient` |
| M07 Technicians | `getTechnicians`, `getTechnicianById`, `createTechnician`, `updateTechnician` |
| M10 ServiceReq | `getServiceRequests`, `createServiceRequest`, `getClientsAndAssets` |

---

## 11. Despliegue y Configuración

### 11.1 Variables de Entorno Requeridas

```env
# Base de datos
DATABASE_URL="file:./dev.db"              # SQLite (dev)
DATABASE_URL="postgresql://..."            # PostgreSQL (producción)

# NextAuth
AUTH_SECRET="[string aleatoria 32+ chars]"
NEXTAUTH_URL="https://tu-dominio.com"

# Opcional: OAuth providers
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 11.2 Scripts de NPM

```bash
npm run dev          # Servidor de desarrollo (port 3000)
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run db:push      # Aplicar cambios de schema sin migración
npm run db:migrate   # Crear y aplicar migración
npm run db:seed      # Cargar datos de demostración
npm run db:studio    # Abrir Prisma Studio (GUI de BD)
```

### 11.3 Proceso de Seed (Datos Demo)

El seed (`prisma/seed.ts`) carga:
- **1 Organización**: IMECOL S.A.S.
- **22 Usuarios**: admin, supervisor, 20 técnicos
- **20 Técnicos**: perfiles reales con certificaciones
- **50 Clientes**: 13 ingenios + 37 palmicultores con datos reales
- **2 Marcas**: CASE IH, JOHN DEERE
- **100 Activos**: cosechadoras y tractores
- **10 Proyectos correctivos** con Gantt (5-8 actividades cada uno)
- **30 Órdenes preventivas**
- **150 Órdenes históricas cerradas** (últimos 6 meses, con costos y horas reales)

---

## 12. Fases de Desarrollo

| Fase | Descripción | Estado |
|------|-------------|--------|
| **Fase 1** | MVP: Login, Dashboard, Clientes, Activos, OTs, Planes, Técnicos, PWA | ✅ Completo |
| **Fase 2** | Agenda avanzada, modo offline, QR, firmas, solicitudes, alertas | 🔄 En progreso |
| **Fase 3** | IA documental: carga de manuales, extracción de texto, asistente técnico | ⏳ Pendiente |
| **Fase 4** | Analítica avanzada: MTBF, MTTR, predictivo, reportes gerenciales | ⏳ Pendiente |
| **Fase 5** | Integraciones: ERP, CRM, WhatsApp, telemetría, IoT, GPS | ⏳ Pendiente |

---

## 13. Decisiones de Diseño Clave

### ¿Por qué Next.js App Router en lugar de API REST separada?
- Reduces el boilerplate de endpoints
- Las Server Actions permiten mutaciones tipadas de extremo a extremo
- RSC elimina waterfall de datos — el servidor consulta la BD y renderiza en el mismo paso
- Simplicidad de deployment (un solo proceso Node.js)

### ¿Por qué SQLite en desarrollo y PostgreSQL en producción?
- SQLite no requiere infraestructura adicional en desarrollo
- Prisma abstrae las diferencias — el cambio es solo en `DATABASE_URL` y en `provider`

### ¿Por qué Recharts en lugar de Chart.js o D3?
- API declarativa compatible con React
- Soporte nativo para datos reactivos (actualización en tiempo real con `useMemo`)
- Permite `<Cell>` individualizado para el comportamiento de hover PowerBI-style

### ¿Por qué separar `@core` de `modules`?
- `@core` contiene lo genérico (UI, lib, tipos) — reutilizable en cualquier proyecto
- `modules` contiene la lógica de dominio específica de AgroMaint Pro
- Facilita escalar a monorepo en el futuro

---

*Documento generado: Junio 2026 · AgroMaint Pro · IMECOL S.A.S.*
