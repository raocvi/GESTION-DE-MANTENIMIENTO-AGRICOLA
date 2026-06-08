import type { Metadata } from 'next'
import Link from 'next/link'
import { getWorkOrders } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'
import { ClipboardList, Plus, Search, Tractor, User, Calendar, ArrowRight, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Órdenes de Trabajo — AgroMaint Pro' }

const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  new:                { label: 'Nueva',                  cls: 'bg-slate-100 text-slate-700',    dot: 'bg-slate-400' },
  requested:          { label: 'Solicitada',             cls: 'bg-blue-100 text-blue-700',      dot: 'bg-blue-500' },
  approved:           { label: 'Aprobada',               cls: 'bg-cyan-100 text-cyan-700',      dot: 'bg-cyan-500' },
  scheduled:          { label: 'Programada',             cls: 'bg-indigo-100 text-indigo-700',  dot: 'bg-indigo-500' },
  assigned:           { label: 'Asignada',               cls: 'bg-violet-100 text-violet-700',  dot: 'bg-violet-500' },
  en_route:           { label: 'En camino',              cls: 'bg-purple-100 text-purple-700',  dot: 'bg-purple-500' },
  in_progress:        { label: 'En ejecución',           cls: 'bg-amber-100 text-amber-700',    dot: 'bg-amber-500' },
  paused:             { label: 'Pausada',                cls: 'bg-orange-100 text-orange-700',  dot: 'bg-orange-500' },
  pending_parts:      { label: 'Pend. repuestos',        cls: 'bg-yellow-100 text-yellow-700',  dot: 'bg-yellow-500' },
  pending_approval:   { label: 'Pend. aprobación',       cls: 'bg-lime-100 text-lime-700',      dot: 'bg-lime-500' },
  pending_client:     { label: 'Pend. cliente',          cls: 'bg-green-100 text-green-700',    dot: 'bg-green-500' },
  completed_by_tech:  { label: 'Finalizada téc.',        cls: 'bg-teal-100 text-teal-700',      dot: 'bg-teal-500' },
  in_review:          { label: 'En revisión',            cls: 'bg-sky-100 text-sky-700',        dot: 'bg-sky-500' },
  closed:             { label: 'Cerrada',                cls: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-500' },
  cancelled:          { label: 'Cancelada',              cls: 'bg-red-100 text-red-700',        dot: 'bg-red-500' },
  reopened:           { label: 'Reabierta',              cls: 'bg-rose-100 text-rose-700',      dot: 'bg-rose-500' },
}

const TYPE_MAP: Record<string, { label: string; color: string }> = {
  preventive:  { label: 'Preventivo', color: 'text-blue-600 bg-blue-50' },
  corrective:  { label: 'Correctivo', color: 'text-red-600 bg-red-50' },
  inspection:  { label: 'Inspección', color: 'text-emerald-600 bg-emerald-50' },
  emergency:   { label: 'Emergencia', color: 'text-rose-600 bg-rose-50' },
  warranty:    { label: 'Garantía',   color: 'text-amber-600 bg-amber-50' },
}

const PRIO_MAP: Record<string, string> = {
  critical: 'text-rose-700 bg-rose-100',
  high:     'text-orange-700 bg-orange-100',
  medium:   'text-amber-700 bg-amber-100',
  low:      'text-blue-700 bg-blue-100',
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams
  const orders = await getWorkOrders(search)

  const now = new Date()
  const stats = {
    total: orders.length,
    open: orders.filter(o => !['closed', 'cancelled'].includes(o.status)).length,
    delayed: orders.filter(o => o.dueDate && new Date(o.dueDate) < now && !['closed', 'cancelled'].includes(o.status)).length,
    closed: orders.filter(o => o.status === 'closed').length,
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-brand text-white shadow-md shrink-0">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Órdenes de Trabajo</h1>
            <p className="text-sm text-slate-400 mt-0.5">{orders.length} órdenes en el sistema</p>
          </div>
        </div>
        <Link
          href="/ordenes/nueva"
          className="inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2.5 text-sm font-bold text-white shadow-md hover:opacity-90 transition-all active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" /> Nueva OT
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="text-3xl font-black text-blue-600">{stats.total}</div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Total Órdenes</p>
        </div>
        <div className="kpi-card">
          <div className="text-3xl font-black text-amber-600">{stats.open}</div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Activas</p>
        </div>
        <div className="kpi-card interactive" style={{ borderColor: stats.delayed > 0 ? '#fca5a5' : undefined }}>
          <div className={`flex items-center gap-2 text-3xl font-black ${stats.delayed > 0 ? 'text-rose-600' : 'text-slate-300'}`}>
            {stats.delayed > 0 && <AlertTriangle className="h-6 w-6" />}
            {stats.delayed}
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Retrasadas</p>
        </div>
        <div className="kpi-card">
          <div className="text-3xl font-black text-emerald-600">{stats.closed}</div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-2">Cerradas</p>
        </div>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            name="search" defaultValue={search}
            placeholder="Buscar por número, título, activo..."
            className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-medium placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
          />
        </div>
        <button type="submit" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 hover:border-slate-300 transition-all">
          Buscar
        </button>
      </form>

      {/* Table / Empty */}
      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-300 mb-4">
            <ClipboardList className="h-8 w-8" />
          </div>
          <p className="font-bold text-slate-600">No hay órdenes de trabajo</p>
          <p className="text-sm text-slate-400 mt-1">Crea la primera orden para comenzar</p>
          <Link href="/ordenes/nueva" className="mt-5 inline-flex items-center gap-2 rounded-xl gradient-brand px-4 py-2 text-sm font-bold text-white shadow-md hover:opacity-90">
            <Plus className="h-4 w-4" /> Nueva OT
          </Link>
        </div>
      ) : (
        <div className="chart-card overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>N° / Título</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th className="hidden md:table-cell">Activo</th>
                <th className="hidden lg:table-cell">Técnico</th>
                <th className="hidden md:table-cell">Fecha límite</th>
                <th>Prioridad</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order: any) => {
                const status = STATUS_MAP[order.status] || { label: order.status, cls: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' }
                const type = TYPE_MAP[order.type] || { label: order.type, color: 'text-slate-600 bg-slate-50' }
                const prio = PRIO_MAP[order.priority] || 'text-slate-700 bg-slate-100'
                const isDelayed = order.dueDate && new Date(order.dueDate) < now && !['closed', 'cancelled'].includes(order.status)

                return (
                  <tr key={order.id} className={isDelayed ? 'bg-rose-50/40' : ''}>
                    <td>
                      <div className="flex items-start gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${type.color} text-xs font-black mt-0.5`}>
                          OT
                        </div>
                        <div>
                          <Link href={`/ordenes/${order.id}`} className="font-bold text-slate-900 hover:text-blue-600 transition-colors text-sm leading-tight block">
                            {order.orderNumber || `#${order.id.slice(-6).toUpperCase()}`}
                          </Link>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{order.title}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${type.color}`}>{type.label}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${status.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </td>
                    <td className="hidden md:table-cell">
                      {order.asset ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <Tractor className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600 font-medium">{order.asset.internalCode}</span>
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td className="hidden lg:table-cell">
                      {order.assignedTo ? (
                        <div className="flex items-center gap-1.5 text-xs">
                          <User className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-600 font-medium">{order.assignedTo.name.split(' ')[0]}</span>
                        </div>
                      ) : <span className="text-slate-300 text-xs">Sin asignar</span>}
                    </td>
                    <td className="hidden md:table-cell">
                      {order.dueDate ? (
                        <div className={`flex items-center gap-1.5 text-xs ${isDelayed ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                          {isDelayed && <AlertTriangle className="h-3 w-3" />}
                          <Calendar className="h-3 w-3" />
                          {formatDate(new Date(order.dueDate))}
                        </div>
                      ) : <span className="text-slate-300 text-xs">—</span>}
                    </td>
                    <td>
                      <span className={`status-pill ${prio}`}>
                        {(order.priority || 'media').charAt(0).toUpperCase() + (order.priority || 'media').slice(1)}
                      </span>
                    </td>
                    <td>
                      <Link href={`/ordenes/${order.id}`} className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
                        Ver <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
