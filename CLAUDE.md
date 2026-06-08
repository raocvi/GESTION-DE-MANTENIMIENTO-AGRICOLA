@AGENTS.md

# AgroMaint Pro — Contexto del Proyecto para IA

## ¿Qué es este software?
Sistema SaaS de gestión de mantenimiento de maquinaria agrícola para **IMECOL S.A.S.** (distribuidor oficial CASE IH en Colombia). Sirve a 50 clientes reales: 13 ingenios azucareros (Providencia, Manuelita, Risaralda, Pichichi, Incauca, etc.) y 37 palmicultores (Oleoflores, Unipalma, Indupalma, etc.). Gestiona 20 técnicos de campo, 100 activos (cosechadoras A9900 + tractores 8R), órdenes de trabajo, planes preventivos y proyectos con diagrama Gantt.

## Tecnología
- **Next.js 15** App Router con React Server Components y Server Actions (`'use server'`)
- **Prisma ORM** sobre SQLite (dev) / PostgreSQL (prod)
- **NextAuth 5** con JWT strategy (bcrypt salt 12)
- **Tailwind CSS** + design system en `app/globals.css`
- **Recharts** para gráficas PowerBI-style con cross-filtering
- **Zustand** para estado global en cliente
- **date-fns** para manipulación de fechas en Gantt

## Estructura clave
```
@core/lib/db.ts           → Singleton PrismaClient
@core/lib/auth.ts         → Configuración NextAuth
@core/types/index.ts      → Todos los tipos TypeScript del dominio
@core/constants/index.ts  → Enums y opciones de dropdowns
modules/M04_work_orders/  → Módulo central: OTs, proyectos, Gantt
modules/M06_clients/      → CRUD de clientes (ingenios + palmicultores)
modules/M07_technicians/  → CRUD de técnicos
prisma/schema.prisma      → Esquema completo de BD
prisma/seed.ts            → 50 clientes reales + 20 técnicos + 150 OTs históricas
docs/SDD.md               → Software Design Document completo
docs/MCP.md               → Master Control Plan completo
```

## Patrones importantes

### Server Actions (mutaciones)
- Toda mutación de datos usa Server Actions en `modules/*/actions.ts`
- Patrón: `'use server'` → validar → `db.entity.create/update` → `revalidatePath` → `redirect`

### Dashboard cross-filtering
- Estado en `InteractiveDashboard.tsx`: `selectedType`, `selectedTech`, `delayedOnly`, `activeOnly`
- Métricas recalculadas con `useMemo` sobre `filteredOrders` — sin re-fetch de BD
- `actualHours` DEBE estar en el objeto serializado de `dashboard/page.tsx`

### Gráficas PowerBI-style (Recharts)
- `cursor={false}` en `<Tooltip>` → elimina el rectángulo gris de fondo en hover
- `activeShape={undefined}` en `<Pie>` → desactiva el efecto de expansión por defecto
- `fill={color}` EXPLÍCITO en `<Cell>` de barras agrupadas → sin él las barras son transparentes
- Hover: solo el elemento SVG cambia via `style.filter: 'brightness(1.15)'` y `style.opacity`

### Gantt (InteractiveGantt.tsx)
- Posición de barra: `left = differenceInDays(startDate, chartStart) × dayWidth`
- Ancho de barra: `width = differenceInDays(endDate, startDate) × dayWidth`
- Línea "HOY": `left = differenceInDays(new Date(), chartStart) × dayWidth`
- dayWidth: 44px/día en vista días, 12px/día en vista semanas
- Actualización optimista: estado local inmediato + Server Action asíncrono

### Clasificación de clientes
```typescript
function esIngenio(name: string): boolean {
  return name.startsWith('Ingenio') ||
    ['Incauca', 'Riopaila Castilla', 'Central Tumaco'].some(k => name.startsWith(k))
}
```
Los ingenios van primero en el listado, los palmicultores después.

## Design system
- Sidebar: navy `#0f1c2e`, grupos: Principal / Gestión / Análisis
- Clases CSS: `.kpi-card` `.chart-card` `.data-table` `.status-pill` `.filter-chip` `.gradient-brand` `.nav-item`
- Colores semánticos: emerald=completado, blue=progreso, rose=retrasado, amber=advertencia, violet=especialista
- Ingenios: avatar `from-amber-500 to-orange-600`
- Palmicultores: avatar `from-emerald-500 to-teal-600`
- Gradientes de sistema: Motor=rojo, Hidráulico=azul, Transmisión=violeta, Eléctrico=ámbar, Corte=verde

## Credenciales demo
- Admin: `admin@imecol.com.co` / `AgroMaint2024!`
- Supervisor: `supervisor@imecol.com.co` / `AgroMaint2024!`
- Técnico: `tecnico1@imecol.com.co` / `AgroMaint2024!`

## Git
- Rama activa: `prueba2`
- Remoto: `https://github.com/raocvi/GESTION-DE-MANTENIMIENTO-AGRICOLA`

## Documentación completa
Ver `docs/SDD.md` (arquitectura técnica) y `docs/MCP.md` (plan maestro de control).
