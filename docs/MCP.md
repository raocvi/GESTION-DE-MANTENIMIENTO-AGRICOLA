# MCP — Master Control Plan
## AgroMaint Pro · IMECOL S.A.S.
### Plan Maestro de Control del Proyecto de Software

**Documento:** MCP-AGROMAINT-001  
**Versión:** 1.0  
**Fecha:** Junio 2026  
**Responsable:** ANTIGRAVITY / IMECOL S.A.S.  
**Clasificación:** Confidencial

---

## 1. Visión del Producto

AgroMaint Pro nace para digitalizar y optimizar el servicio posventa de IMECOL S.A.S., transformando la gestión de mantenimiento de maquinaria agrícola de procesos en papel a un sistema inteligente, trazable y orientado a datos. El objetivo final es maximizar la **disponibilidad de flota** y **reducir los costos de mantenimiento** de los clientes de IMECOL mediante información oportuna y procesos estandarizados.

### 1.1 Propuesta de Valor

| Stakeholder | Problema actual | Solución AgroMaint Pro |
|-------------|----------------|------------------------|
| **IMECOL** | Órdenes en papel, sin historial digital | Dashboard gerencial, KPIs en tiempo real |
| **Técnico de campo** | Sin información del equipo en campo | App móvil/PWA con historial completo |
| **Ingenio / Palmicultor** | Sin visibilidad de próximos mantenimientos | Portal de cliente con agenda y alertas |
| **Coordinador** | Dificultad para asignar y priorizar | Kanban de órdenes, carga de técnicos |
| **Gerente** | Sin indicadores de servicio confiables | MTBF, MTTR, costos, disponibilidad de flota |

---

## 2. Mapa de Módulos del Sistema

### 2.1 Estado Actual de Módulos

| # | Módulo | Estado | Ruta | Descripción |
|---|--------|--------|------|-------------|
| M01 | **Dashboard Gerencial** | ✅ Funcional | `/dashboard` | KPIs interactivos, 3 perspectivas, 6 gráficas cross-filtering |
| M02 | **Gestión de Activos** | ✅ Funcional | `/activos` | Ficha digital de equipos, horómetro, estado operativo |
| M03 | **Clientes y Sedes** | ✅ Funcional | `/clientes` | CRM básico, 50 clientes reales (ingenios + palmicultores) |
| M04 | **Órdenes de Trabajo** | ✅ Funcional | `/ordenes` | 13 tipos, 16 estados, prioridades, costos |
| M04b | **Proyectos / Gantt** | ✅ Funcional | `/proyectos` | Gantt interactivo, actividades, subtareas, progreso |
| M05 | **Planes de Mantenimiento** | ✅ Funcional | `/planes` | Planes preventivos CASE IH A9900, 6 intervalos |
| M06 | **Técnicos** | ✅ Funcional | `/tecnicos` | 20 técnicos, niveles, especialidades, certificaciones |
| M07 | **Solicitudes de Servicio** | ✅ Funcional | `/solicitudes` | Canal de entrada de solicitudes de clientes |
| M08 | **Checklists e Inspecciones** | ⏳ Pendiente | `/inspecciones` | Templates dinámicos, ejecución móvil |
| M09 | **Repuestos e Inventario** | ⏳ Pendiente | `/repuestos` | Stock, entradas/salidas, alertas mínimo |
| M10 | **Agenda y Planeación** | ⏳ Pendiente | `/agenda` | Calendario, drag-and-drop, carga de técnicos |
| M11 | **Manuales e IA Técnica** | ⏳ Pendiente | `/manuales` | Carga de PDF, extracción de texto, asistente IA |
| M12 | **Garantías y Contratos** | ⏳ Pendiente | `/garantias` | Seguimiento de garantías, alertas de vencimiento |
| M13 | **Analítica y Reportes** | 🔄 Parcial | `/reportes` | Dashboard actual, reportes PDF pendientes |
| M14 | **QR y Trazabilidad** | ⏳ Pendiente | `/qr` | Generación e impresión de etiquetas QR |
| M15 | **Modo Offline** | ⏳ Pendiente | PWA | Service Worker, sincronización al recuperar conexión |
| M16 | **Configuración** | 🔄 Parcial | `/configuracion` | Página base, sin lógica completa |
| M17 | **Importación Excel** | ⏳ Pendiente | — | Importador de activos, planes, repuestos |
| M18 | **PDF de Servicio** | ⏳ Pendiente | — | Generación de informe al cerrar orden |
| M19 | **Seguridad y Auditoría** | 🔄 Parcial | — | Auth JWT funcional, AuditLog en schema |

**Leyenda:** ✅ Funcional · 🔄 Parcial · ⏳ Pendiente

---

## 3. Registro de Datos Maestros

### 3.1 Clientes Cargados en Sistema

#### Ingenios Azucareros (13)

| Código | Nombre | Ciudad | Departamento | Contacto |
|--------|--------|--------|-------------|---------|
| CLI-001 | Ingenio Providencia S.A. | Palmira | Valle del Cauca | Pedro Isaías Caicedo |
| CLI-002 | Ingenio Manuelita S.A. | Palmira | Valle del Cauca | Diego Villegas |
| CLI-003 | Ingenio Risaralda S.A. | La Virginia | Risaralda | Carlos Arturo Ángel |
| CLI-004 | Ingenio La Cabaña S.A. | Florida | Valle del Cauca | Andrés Guzmán |
| CLI-005 | Ingenio Pichichi S.A. | Guacarí | Valle del Cauca | Jorge Molina |
| CLI-006 | Incauca S.A. | Miranda | Cauca | Germán Montoya |
| CLI-007 | Ingenio Carmelita S.A. | San Pedro | Valle del Cauca | Luis Evaristo Potes |
| CLI-008 | Ingenio Castilla S.A. | Candelaria | Valle del Cauca | Ricardo Vélez |
| CLI-009 | Ingenio Mayagüez S.A. | El Cerrito | Valle del Cauca | Rodrigo Lloreda |
| CLI-010 | Ingenio San Carlos S.A. | Palmira | Valle del Cauca | Héctor Parra |
| CLI-011 | Riopaila Castilla S.A. | Riofrío | Valle del Cauca | Bernardo Quintero |
| CLI-012 | Central Tumaco S.A. | Tumaco | Nariño | Rafael Guerrero |
| CLI-013 | Ingenio del Cauca S.A. | Santander de Quilichao | Cauca | Alejandro Aristizábal |

#### Palmicultores (37)

| Rango | Empresas | Regiones |
|-------|----------|---------|
| CLI-014..018 | Palmeras de la Costa, Palmas del César, Oleoflores, Extractora Loma Grande, PALOC | Córdoba, César, Magdalena, Casanare |
| CLI-019..023 | Ecodiesel Colombia, Padelma, Palmeras Puerto Wilches, Agroince, Extractora El Roble | Santander, Córdoba, Bolívar |
| CLI-024..028 | Unipalma, Extractora Palmar de Oriente, Bio D, Palmas del Magdalena, Indupalma | Meta, Cundinamarca, Magdalena, César |
| CLI-029..033 | Palmeras del Pacífico, Coopal, Palmar de Oriente, Inversiones La Paz, Palmeras La Concepción | Nariño, Meta, César, Bolívar |
| CLI-034..050 | C.I. Tequendama, Agropecuaria El Palmar, Palomino Agroindustrial, Agropalmares, Extractora La Gloria, y más | Santander, Córdoba, Bolívar, Meta, César, Arauca |

---

### 3.2 Equipo Técnico IMECOL (20 técnicos)

| Código | Nombre | Nivel | Especialidad Principal |
|--------|--------|-------|----------------------|
| TECH-001 | Juan Carlos Montoya | Specialist | Cosechadoras CASE IH A9900, Hidráulica Alta Presión |
| TECH-002 | Andrés Felipe Gómez | Senior | Motores Diésel FPT, Transmisiones Powershift |
| TECH-003 | Carlos Alberto Rodríguez | Mid | Mecánica Tractores, Sistemas de Enfriamiento |
| TECH-004 | Diego Alejandro Martínez | Junior | Mantenimiento Preventivo, Lubricación |
| TECH-005 | José Luis Herrera | Senior | Sistemas Eléctricos Cabina, Monitores GPS |
| TECH-006 | Luis Fernando Castro | Specialist | Piloto Automático AFS/AMS, Telemetría |
| TECH-007 | Francisco Javier Ospina | Mid | Bombas de Pistones, Válvulas Hidráulicas |
| TECH-008 | Jorge Mario Gutiérrez | Senior | Reconstrucción de Motores, Soldadura |
| TECH-009 | Gustavo Adolfo Ortiz | Junior | Engrase General, Logística de Taller |
| TECH-010 | Harold Yesid Valencia | Mid | Sistemas de Frenos, Mandos Finales |
| TECH-011 | Mauricio de Jesús Cardona | Senior | Cosechadoras JD CH570, Extractor/Picador |
| TECH-012 | Wilson Alexander Agudelo | Mid | Sistemas Eléctricos 12V/24V, CanBus |
| TECH-013 | Rodrigo Hernán Muñoz | Senior | Tractores Alta Potencia, Orugas |
| TECH-014 | Hernán Darío Jaramillo | Mid | Inyección Combustible, Turbocompresores |
| TECH-015 | Álvaro León Ramírez | Specialist | Diagnóstico CanBus Avanzado, Calibraciones |
| TECH-016 | Gabriel Jaime Restrepo | Mid | Análisis de Lubricantes, Inspecciones |
| TECH-017 | William Alberto Ocampo | Senior | Transmisiones Hidrostáticas, Mandos Finales |
| TECH-018 | Nelson Enrique Salazar | Mid | Soldadura MIG/TIG, Reparación de Chasis |
| TECH-019 | Oscar Mario Zapata | Junior | Lubricación, Neumáticos, Niveles |
| TECH-020 | Víctor Manuel Piedrahita | Senior | Diagnóstico Eléctrico/Electrónico, Suspensión |

---

### 3.3 Flota de Activos en Sistema (100 equipos demo)

| Rango IDs | Tipo | Marca | Modelo |
|-----------|------|-------|--------|
| EQ-001..050 (impares) | Cosechadora | CASE IH | A9900 |
| EQ-002..100 (pares) | Tractor | JOHN DEERE | 8R 370 |

---

## 4. Reglas de Negocio

### 4.1 Numeración de Órdenes de Trabajo

```
OT-{YYMMDD}-{COUNTER_4DIGITS}
Ejemplo: OT-260607-1234
```
- `YYMMDD`: fecha de creación
- `COUNTER`: contador secuencial de 4 dígitos del día

### 4.2 Alertas de Mantenimiento por Horómetro

| Condición | Estado visual | Acción recomendada |
|-----------|--------------|-------------------|
| `nextService - currentHours < 100h` | 🔴 Rojo crítico | Programar inmediatamente |
| `100h ≤ diferencia < 250h` | 🟡 Ámbar advertencia | Programar pronto |
| `diferencia ≥ 250h` | ⚪ Normal | Sin acción urgente |
| `diferencia ≤ 0h` (vencido) | 🔴 VENCIDO | Acción inmediata |

### 4.3 Estados de Orden de Trabajo — Transiciones Válidas

```
new → requested → approved → scheduled → assigned → en_route → in_progress
                                                                    ↓
paused ←────────────────────────────────────────────────────────────┤
pending_parts ←─────────────────────────────────────────────────────┤
pending_approval ←──────────────────────────────────────────────────┤
pending_client ←────────────────────────────────────────────────────┘
    ↓
completed_by_tech → in_review → closed
                              → cancelled
                              → reopened → in_progress
```

### 4.4 Cálculo de Progreso en Proyectos

- El progreso de un proyecto es el **promedio del progreso de todas sus tareas** (`tasks[].progress`)
- El progreso de una tarea puede ser manual (slider 0-100) o **automático basado en subtareas** (si todas se marcan completadas → 100%)
- Una tarea se considera retrasada si `endDate < today && progress < 100`

### 4.5 Clasificación de Clientes

```typescript
function esIngenio(name: string): boolean {
  return (
    name.startsWith('Ingenio') ||
    name.startsWith('Incauca') ||
    name.startsWith('Riopaila Castilla') ||
    name.startsWith('Central Tumaco')
  )
}
```

### 4.6 Colores Semánticos de Estado

| Estado / Condición | Color | Código |
|--------------------|-------|--------|
| Completado / Operativo | Emerald | `#10b981` |
| En progreso / En mantenimiento | Blue | `#3b82f6` |
| Retrasado / Fuera de servicio | Rose | `#f43f5e` |
| Pausado / Advertencia | Amber | `#f59e0b` |
| Pendiente / Normal | Slate | `#94a3b8` |
| Crítico / Urgente | Red | `#ef4444` |
| Especialista / Senior | Violet | `#8b5cf6` |

---

## 5. Especificación de Interfaces por Módulo

### 5.1 Dashboard — Estructura de Datos

```typescript
// Datos cargados desde el servidor (dashboard/page.tsx)
interface SerializedOrder {
  id: string
  number: string
  title: string
  type: WorkOrderType           // 'preventive' | 'corrective' | ...
  status: WorkOrderStatus       // 'new' | 'in_progress' | 'closed' | ...
  priority: Priority            // 'low' | 'medium' | 'high' | 'critical' | ...
  createdAt: string             // ISO string
  dueDate: string | null
  closedAt: string | null
  startedAt: string | null
  actualHours: number           // REQUERIDO para gráfica de horas laboradas
  laborCost: number
  partsCost: number
  totalCost: number
  asset: { id: string; name: string; internalCode: string } | null
  client: { id: string; name: string } | null
  assignedTo: { id: string; name: string } | null
}
```

### 5.2 Gantt — Estructura de Task

```typescript
interface GanttTask {
  id: string
  name: string
  startDate: Date | string | null
  endDate: Date | string | null
  progress: number              // 0-100
  status: string                // 'pending' | 'in_progress' | 'completed' | 'paused'
  technician?: { name: string } | null
  technicianId?: string | null
  estimatedHours?: number | null
  notes?: string | null
  subtasks?: Array<{
    id: string
    name: string
    isCompleted: boolean
  }>
}
```

### 5.3 Tipos Globales (@core/types/index.ts)

```typescript
type Priority = 'low' | 'medium' | 'high' | 'critical' | 'stopped' | 'safety'
type Criticality = 'low' | 'medium' | 'high' | 'critical'
type AssetStatus = 'operative' | 'maintenance' | 'out_of_service' | 'warranty' | 'pending_parts' | 'diagnosis' | 'retired'
type WorkOrderStatus = 'new' | 'requested' | 'approved' | 'scheduled' | 'assigned' | 'en_route' | 'in_progress' | 'paused' | 'pending_parts' | 'pending_approval' | 'pending_client' | 'completed_by_tech' | 'in_review' | 'closed' | 'cancelled' | 'reopened'
type WorkOrderType = 'preventive' | 'corrective' | 'inspection' | 'predictive' | 'warranty' | 'emergency' | 'campaign' | 'predelivery' | 'seasonal_pre' | 'seasonal_post' | 'daily_operator'
type FrequencyType = 'hours' | 'km' | 'days' | 'months' | 'years'
type MeasureUnit = 'hours' | 'km' | 'acres' | 'tons' | 'cycles'
```

---

## 6. Plan de Pruebas

### 6.1 Criterios de Aceptación — Fase 1

| # | Criterio | Resultado esperado |
|---|---------|-------------------|
| 1 | Login con credenciales válidas | Redirige a /dashboard |
| 2 | Login con credenciales incorrectas | Muestra error |
| 3 | Dashboard carga con datos | KPIs muestran números > 0 |
| 4 | Clic en gráfica de tipo filtra todas las demás | Gráficas se actualizan |
| 5 | Crear cliente | Aparece en listado de clientes |
| 6 | Crear orden de trabajo | OT con número OT-YYMMDD-XXXX |
| 7 | Cambiar progreso de tarea en Gantt | Barra del Gantt se actualiza |
| 8 | Marcar subtarea como completada | Progreso de tarea aumenta automáticamente |
| 9 | Línea "HOY" visible en Gantt | Línea azul con etiqueta "HOY" |
| 10 | Listado de clientes: ingenios primero | Grupo "Ingenios" antes de "Palmicultores" |

### 6.2 Escenarios de Prueba por Módulo

#### Dashboard
- Órdenes con `actualHours = 0` no aparecen en "Horas Laboradas"
- Órdenes con `closedAt = null` no se cuentan en MTTR
- Cross-filter: seleccionar técnico filtra todos los KPIs y gráficas
- Tab "Por Técnico" → Tab "Por Cliente" limpia filtros anteriores

#### Órdenes de Trabajo
- OT con `dueDate < hoy` y estado no cerrado → marcada como retrasada (fondo rosa)
- OT tipo `corrective` aparece en `/proyectos` si tiene tareas
- Contador de órdenes retrasadas en KPIs coincide con los marcados en tabla

#### Gantt
- Tarea sin `startDate` ni `endDate` → muestra botón "Sin fechas — clic para editar"
- Barra de tarea completada (progress=100) → color verde
- Guardar cambios en modal → actualización optimista inmediata + Server Action

---

## 7. Puntos de Integración (Fase 5)

| Sistema externo | Tipo de integración | Prioridad |
|----------------|---------------------|----------|
| ERP (SAP / Siesa) | Sincronización de clientes y costos | Alta |
| WhatsApp Business API | Notificaciones a clientes y técnicos | Alta |
| Sistema de telemetría CASE IH | Lectura automática de horómetros | Media |
| GPS/GNSS de equipos | Ubicación en tiempo real de activos | Media |
| S3 / Azure Blob / GCS | Almacenamiento de fotos y PDF | Alta |
| SendGrid / Mailgun | Envío de reportes y alertas por email | Media |
| Google SSO / Microsoft 365 | Autenticación empresarial | Baja |

---

## 8. Arquitectura de Seguridad

### 8.1 Capas de Seguridad

```
┌─────────────────────────────────────┐
│  1. Middleware Auth (Next.js)        │  Verifica JWT antes de cada request
├─────────────────────────────────────┤
│  2. NextAuth JWT Strategy            │  Tokens firmados con AUTH_SECRET
├─────────────────────────────────────┤
│  3. bcrypt (salt 12)                 │  Hash de contraseñas en BD
├─────────────────────────────────────┤
│  4. Server Actions                   │  Lógica de negocio en servidor
├─────────────────────────────────────┤
│  5. Zod Validation                   │  Validación en cliente y servidor
├─────────────────────────────────────┤
│  6. Prisma ORM                       │  Previene SQL injection
├─────────────────────────────────────┤
│  7. Soft Delete                      │  No elimina datos permanentemente
└─────────────────────────────────────┘
```

### 8.2 Consideraciones para Producción

- [ ] Cambiar `DATABASE_URL` a PostgreSQL con SSL
- [ ] Configurar `AUTH_SECRET` con `openssl rand -base64 32`
- [ ] Habilitar HTTPS (certificado SSL)
- [ ] Configurar `NEXTAUTH_URL` con el dominio real
- [ ] Implementar rate limiting en endpoints de autenticación
- [ ] Configurar CORS apropiado
- [ ] Habilitar CSP (Content Security Policy)
- [ ] Configurar backups automáticos de BD
- [ ] Habilitar logging de auditoría (tabla `audit_logs` ya existe en schema)

---

## 9. Design System — Guía de Uso

### 9.1 Jerarquía de Componentes

```
AppShell
├── TopNavigation          (blanca, barra de búsqueda central)
└── SideNavigation         (navy #0f1c2e, grupos Principal/Gestión/Análisis)
    └── main
        ├── page-header    (título + descripción + acciones)
        ├── kpi-cards      (grid 2-4 columnas)
        ├── filters        (search + filter-chips)
        └── content
            ├── chart-card (gráficas)
            ├── data-table (tablas)
            └── module-specific
```

### 9.2 Convención de Nomenclatura CSS

| Prefijo | Tipo | Ejemplo |
|---------|------|---------|
| `.kpi-` | Tarjeta KPI | `.kpi-card` |
| `.chart-` | Contenedor de gráfica | `.chart-card` |
| `.data-` | Tablas | `.data-table` |
| `.filter-` | Filtros | `.filter-chip` |
| `.status-` | Badges de estado | `.status-pill` |
| `.nav-` | Navegación | `.nav-item` |
| `.gradient-` | Gradientes | `.gradient-brand` |
| `.animate-` | Animaciones | `.animate-fade-in` |

### 9.3 Gradientes por Contexto

| Contexto | Gradiente Tailwind |
|----------|-------------------|
| Acción primaria | `gradient-brand` (azul corporativo) |
| Exitoso / Completado | `gradient-emerald` |
| Advertencia / Retrasado | `gradient-amber` |
| Error / Crítico | `gradient-rose` |
| Especial / Premium | `gradient-violet` |
| Ingenios azucareros | `from-amber-500 to-orange-600` |
| Palmicultores | `from-emerald-500 to-teal-600` |

---

## 10. Glosario de Términos

| Término | Definición |
|---------|-----------|
| **Activo / Equipo** | Maquinaria agrícola registrada en el sistema (cosechadora, tractor, etc.) |
| **Horómetro** | Contador de horas de operación del equipo, equivalente al odómetro en vehículos |
| **OT / Orden de Trabajo** | Documento que autoriza y registra una intervención técnica sobre un equipo |
| **Plan Preventivo** | Conjunto de tareas de mantenimiento programadas según intervalos del fabricante |
| **MTBF** | Mean Time Between Failures — Tiempo promedio entre fallas |
| **MTTR** | Mean Time To Repair — Tiempo promedio de resolución de una falla |
| **Disponibilidad de Flota** | Porcentaje de equipos operativos sobre el total en un período dado |
| **Cross-filtering** | Comportamiento en el que seleccionar un elemento de una gráfica filtra todas las demás |
| **Gantt** | Diagrama de barras horizontales que muestra el cronograma de actividades de un proyecto |
| **Ingenio** | Empresa dedicada al cultivo y procesamiento de caña de azúcar |
| **Palmicultor** | Empresa dedicada al cultivo de palma de aceite |
| **Checklist** | Lista de verificación de items a inspeccionar o confirmar durante un mantenimiento |
| **Subtarea** | Ítem individual dentro de una actividad del Gantt, completable individualmente |
| **Server Action** | Función de Next.js ejecutada en el servidor que puede mutar datos de la BD |
| **RSC** | React Server Component — componente renderizado en el servidor |
| **PWA** | Progressive Web App — Aplicación web instalable en dispositivos móviles |
| **Soft delete** | Eliminación lógica (registro con `deletedAt != null`) en lugar de físicamente |
| **upsert** | Operación de BD que crea el registro si no existe o lo actualiza si ya existe |
| **AFS/AMS** | Advanced Farming System / Agricultural Management System (sistemas Case IH) |

---

## 11. Control de Versiones del Documento

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 0.1 | Mayo 2026 | ANTIGRAVITY | Borrador inicial basado en spec de IMECOL |
| 0.5 | Junio 2026 | ANTIGRAVITY | Actualización post-implementación Fase 1 |
| 1.0 | Junio 2026 | ANTIGRAVITY | Versión de referencia con todos los módulos activos |

---

*AgroMaint Pro · IMECOL S.A.S. · Todos los derechos reservados*  
*Desarrollado por ANTIGRAVITY — Junio 2026*
