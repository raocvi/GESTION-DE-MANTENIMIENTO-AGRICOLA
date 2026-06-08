import React from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  Tractor,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  TrendingUp,
  CalendarDays,
} from 'lucide-react'
import { StatsCard, PageHeader } from '@core/components/shared/PageComponents'
import { StatusBadge } from '@core/components/ui/badge'
import { formatDate, formatRelative } from '@core/lib/utils'

export const metadata: Metadata = {
  title: 'Dashboard — AgroMaint Pro',
  description: 'Panel de control de mantenimiento de maquinaria agrícola IMECOL.',
}

// ─── Demo data (será reemplazado por queries reales) ──────────────────────────
const kpis = [
  {
    title: 'Equipos Activos',
    value: '24',
    description: '3 en mantenimiento',
    icon: <Tractor className="h-5 w-5" />,
    color: 'blue' as const,
    trend: { value: 4, label: 'vs mes anterior', positive: true },
  },
  {
    title: 'Órdenes Abiertas',
    value: '18',
    description: '5 vencen esta semana',
    icon: <ClipboardList className="h-5 w-5" />,
    color: 'amber' as const,
    trend: { value: -12, label: 'vs mes anterior', positive: false },
  },
  {
    title: 'Disponibilidad',
    value: '87.5%',
    description: 'Meta: 90%',
    icon: <TrendingUp className="h-5 w-5" />,
    color: 'emerald' as const,
    trend: { value: 2.1, label: 'vs mes anterior', positive: true },
  },
  {
    title: 'Alertas PM',
    value: '7',
    description: 'Mantenimientos próximos',
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'rose' as const,
  },
]

const recentOrders = [
  {
    id: '1',
    number: 'OT-260601-1234',
    title: 'Cambio de aceite motor 500h — A9900 S/N 001',
    status: 'in_progress',
    statusLabel: 'En ejecución',
    priority: 'high',
    priorityLabel: 'Alta',
    assignedTo: 'Carlos Técnico',
    dueDate: new Date('2026-06-08'),
  },
  {
    id: '2',
    number: 'OT-260601-1235',
    title: 'Revisión sistema hidráulico — A9900 S/N 002',
    status: 'scheduled',
    statusLabel: 'Programada',
    priority: 'medium',
    priorityLabel: 'Media',
    assignedTo: 'Laura Servicio',
    dueDate: new Date('2026-06-10'),
  },
  {
    id: '3',
    number: 'OT-260601-1236',
    title: 'Inspección pretemporada — Cosechadora A9900 S/N 003',
    status: 'approved',
    statusLabel: 'Aprobada',
    priority: 'medium',
    priorityLabel: 'Media',
    assignedTo: 'Andrés Campo',
    dueDate: new Date('2026-06-15'),
  },
  {
    id: '4',
    number: 'OT-260531-1230',
    title: 'Reparación falla eléctrica cabina — A9900 S/N 001',
    status: 'pending_parts',
    statusLabel: 'Pendiente repuestos',
    priority: 'high',
    priorityLabel: 'Alta',
    assignedTo: 'Carlos Técnico',
    dueDate: new Date('2026-06-07'),
  },
]

const alerts = [
  {
    id: '1',
    type: 'warning' as const,
    text: 'A9900 S/N 001 — Mantenimiento 500h vence en 45 horas',
    href: '/activos/a9900-001',
  },
  {
    id: '2',
    type: 'error' as const,
    text: 'OT-260531-1230 vence HOY — repuestos pendientes',
    href: '/ordenes/1230',
  },
  {
    id: '3',
    type: 'warning' as const,
    text: 'Stock crítico: Filtro aceite motor A9900 (0 unidades)',
    href: '/repuestos',
  },
  {
    id: '4',
    type: 'info' as const,
    text: 'A9900 S/N 003 — Garantía vence en 14 días',
    href: '/garantias',
  },
]

const alertColors = {
  error:   'border-red-200 bg-red-50 text-red-700',
  warning: 'border-amber-200 bg-amber-50 text-amber-700',
  info:    'border-blue-200 bg-blue-50 text-blue-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Dashboard"
        description="Resumen de operaciones IMECOL S.A.S. — Actualizado ahora"
      />

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatsCard key={kpi.title} {...kpi} />
        ))}
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Órdenes recientes — 2/3 */}
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Órdenes de Trabajo Activas
                </h2>
                <p className="text-xs text-slate-500">
                  {recentOrders.length} órdenes en progreso
                </p>
              </div>
              <Link
                href="/ordenes"
                className="text-xs font-medium text-blue-600 hover:text-blue-800"
              >
                Ver todas →
              </Link>
            </div>
            <div className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/ordenes/${order.id}`}
                  className="flex items-start gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Wrench className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">
                        {order.number}
                      </span>
                    </div>
                    <p className="truncate text-sm font-medium text-slate-800">
                      {order.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <StatusBadge
                        status={order.status}
                        label={order.statusLabel}
                      />
                      <StatusBadge
                        status={order.priority}
                        label={order.priorityLabel}
                      />
                      <span className="text-xs text-slate-400">
                        {order.assignedTo}
                      </span>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(order.dueDate)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Alertas — 1/3 */}
        <div>
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">
                Alertas y Avisos
              </h2>
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                {alerts.length}
              </span>
            </div>
            <div className="flex flex-col gap-2 p-4">
              {alerts.map((alert) => (
                <Link
                  key={alert.id}
                  href={alert.href}
                  className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-opacity hover:opacity-80 ${alertColors[alert.type]}`}
                >
                  {alert.text}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Acciones Rápidas
            </h2>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Nueva OT', href: '/ordenes/nueva', icon: '📋' },
                { label: 'Nuevo Equipo', href: '/activos/nuevo', icon: '🚜' },
                { label: 'Solicitud', href: '/solicitudes/nueva', icon: '📞' },
                { label: 'Inspección', href: '/inspecciones/nueva', icon: '✅' },
              ].map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="flex flex-col items-center gap-1 rounded-lg border border-slate-200 py-3 text-center transition-colors hover:bg-slate-50 hover:border-blue-300"
                >
                  <span className="text-lg">{action.icon}</span>
                  <span className="text-xs font-medium text-slate-700">
                    {action.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
