// ─── Work Order ──────────────────────────────────────────────────────────────
export const WORK_ORDER_TYPES = [
  { value: 'preventive',     label: 'Preventivo',               icon: '🔧' },
  { value: 'corrective',     label: 'Correctivo',               icon: '🔨' },
  { value: 'predictive',     label: 'Predictivo',               icon: '📊' },
  { value: 'inspection',     label: 'Inspección',               icon: '🔍' },
  { value: 'lubrication',    label: 'Lubricación',              icon: '🛢️' },
  { value: 'diagnosis',      label: 'Diagnóstico',              icon: '🩺' },
  { value: 'warranty',       label: 'Garantía',                 icon: '🛡️' },
  { value: 'emergency',      label: 'Emergencia',               icon: '🚨' },
  { value: 'campaign',       label: 'Campaña técnica',          icon: '📢' },
  { value: 'predelivery',    label: 'Alistamiento preentrega',  icon: '📦' },
  { value: 'seasonal_pre',   label: 'Revisión pretemporada',    icon: '☀️' },
  { value: 'seasonal_post',  label: 'Revisión postemporada',    icon: '🌧️' },
  { value: 'daily_operator', label: 'Revisión diaria operador', icon: '📋' },
] as const

export const WORK_ORDER_STATUSES = [
  { value: 'new',               label: 'Nueva',                  color: 'slate'   },
  { value: 'requested',         label: 'Solicitada',             color: 'blue'    },
  { value: 'approved',          label: 'Aprobada',               color: 'cyan'    },
  { value: 'scheduled',         label: 'Programada',             color: 'indigo'  },
  { value: 'assigned',          label: 'Asignada',               color: 'violet'  },
  { value: 'en_route',          label: 'En camino',              color: 'purple'  },
  { value: 'in_progress',       label: 'En ejecución',           color: 'amber'   },
  { value: 'paused',            label: 'Pausada',                color: 'orange'  },
  { value: 'pending_parts',     label: 'Pendiente repuestos',    color: 'yellow'  },
  { value: 'pending_approval',  label: 'Pendiente aprobación',   color: 'lime'    },
  { value: 'pending_client',    label: 'Pendiente cliente',      color: 'green'   },
  { value: 'completed_by_tech', label: 'Finalizada por técnico', color: 'teal'    },
  { value: 'in_review',         label: 'En revisión',            color: 'sky'     },
  { value: 'closed',            label: 'Cerrada',                color: 'emerald' },
  { value: 'cancelled',         label: 'Cancelada',              color: 'red'     },
  { value: 'reopened',          label: 'Reabierta',              color: 'rose'    },
] as const

export const PRIORITIES = [
  { value: 'low',      label: 'Baja',            color: 'slate', icon: '⬇️' },
  { value: 'medium',   label: 'Media',           color: 'blue',  icon: '➡️' },
  { value: 'high',     label: 'Alta',            color: 'amber', icon: '⬆️' },
  { value: 'critical', label: 'Crítica',         color: 'red',   icon: '🔴' },
  { value: 'stopped',  label: 'Equipo detenido', color: 'red',   icon: '🛑' },
  { value: 'safety',   label: 'Seguridad',       color: 'rose',  icon: '⚠️' },
] as const

// ─── Assets ──────────────────────────────────────────────────────────────────
export const ASSET_STATUSES = [
  { value: 'operative',      label: 'Operativo',              color: 'emerald' },
  { value: 'maintenance',    label: 'En mantenimiento',       color: 'amber'   },
  { value: 'out_of_service', label: 'Fuera de servicio',      color: 'red'     },
  { value: 'warranty',       label: 'En garantía',            color: 'blue'    },
  { value: 'pending_parts',  label: 'Pendiente de repuestos', color: 'orange'  },
  { value: 'diagnosis',      label: 'En diagnóstico',         color: 'purple'  },
  { value: 'retired',        label: 'Dado de baja',           color: 'slate'   },
] as const

export const CRITICALITY_LEVELS = [
  { value: 'critical', label: 'Crítico', color: 'red'    },
  { value: 'high',     label: 'Alto',    color: 'orange' },
  { value: 'medium',   label: 'Medio',   color: 'yellow' },
  { value: 'low',      label: 'Bajo',    color: 'slate'  },
] as const

export const MEASURE_UNITS = [
  { value: 'hours',      label: 'Horas (h)'        },
  { value: 'kilometers', label: 'Kilómetros (km)'  },
  { value: 'hectares',   label: 'Hectáreas (ha)'   },
  { value: 'cycles',     label: 'Ciclos'            },
  { value: 'days',       label: 'Días'              },
] as const

// ─── Parts ────────────────────────────────────────────────────────────────────
export const PART_UNITS = [
  { value: 'unit',     label: 'Unidad'    },
  { value: 'liter',    label: 'Litro'     },
  { value: 'kilogram', label: 'Kilogramo' },
  { value: 'meter',    label: 'Metro'     },
  { value: 'set',      label: 'Juego'     },
  { value: 'pair',     label: 'Par'       },
  { value: 'box',      label: 'Caja'      },
] as const

// ─── Maintenance Plans ───────────────────────────────────────────────────────
export const FREQUENCY_TYPES = [
  { value: 'days',   label: 'Días'                  },
  { value: 'hours',  label: 'Horas (horómetro)'     },
  { value: 'months', label: 'Meses'                 },
  { value: 'km',     label: 'Kilómetros'            },
  { value: 'ha',     label: 'Hectáreas'             },
] as const

// ─── Colombia ─────────────────────────────────────────────────────────────────
export const COLOMBIA_DEPARTMENTS = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar',
  'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca',
  'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía',
  'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta',
  'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío',
  'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre',
  'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada',
  'Bogotá D.C.',
] as const

// ─── Navigation ───────────────────────────────────────────────────────────────
export const NAV_MODULES = [
  { id: 'dashboard',         label: 'Dashboard',         href: '/dashboard',    icon: 'LayoutDashboard',  module: 'M02' },
  { id: 'assets',            label: 'Equipos',           href: '/activos',      icon: 'Tractor',          module: 'M03' },
  { id: 'work-orders',       label: 'Órdenes de Trabajo',href: '/ordenes',      icon: 'ClipboardList',    module: 'M04' },
  { id: 'projects',          label: 'Proyectos',         href: '/proyectos',    icon: 'FolderKanban',     module: 'M04' },
  { id: 'maintenance-plans', label: 'Planes de Mant.',   href: '/planes',       icon: 'CalendarDays',     module: 'M05' },
  { id: 'clients',           label: 'Clientes',          href: '/clientes',     icon: 'Building2',        module: 'M06' },
  { id: 'technicians',       label: 'Técnicos',          href: '/tecnicos',     icon: 'HardHat',          module: 'M07' },
  { id: 'parts',             label: 'Repuestos',         href: '/repuestos',    icon: 'Package',          module: 'M08' },
  { id: 'inspections',       label: 'Inspecciones',      href: '/inspecciones', icon: 'ClipboardCheck',   module: 'M09' },
  { id: 'service-requests',  label: 'Solicitudes',       href: '/solicitudes',  icon: 'MessageSquarePlus',module: 'M10' },
  { id: 'warranties',        label: 'Garantías',         href: '/garantias',    icon: 'ShieldCheck',      module: 'M11' },
  { id: 'reports',           label: 'Reportes',          href: '/reportes',     icon: 'BarChart3',        module: 'M12' },
  { id: 'settings',          label: 'Configuración',     href: '/configuracion',icon: 'Settings',         module: 'M14' },
] as const
