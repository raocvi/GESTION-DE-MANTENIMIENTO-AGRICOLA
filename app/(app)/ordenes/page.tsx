import type { Metadata } from 'next'
import Link from 'next/link'
import { getWorkOrders } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'
import { ClipboardList, Plus, Search } from 'lucide-react'

export const metadata: Metadata = { title: 'Órdenes de Trabajo — AgroMaint Pro' }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  new:                { label: 'Nueva',                  cls: 'bg-slate-100 text-slate-700' },
  requested:          { label: 'Solicitada',             cls: 'bg-blue-100 text-blue-700' },
  approved:           { label: 'Aprobada',               cls: 'bg-cyan-100 text-cyan-700' },
  scheduled:          { label: 'Programada',             cls: 'bg-indigo-100 text-indigo-700' },
  assigned:           { label: 'Asignada',               cls: 'bg-violet-100 text-violet-700' },
  en_route:           { label: 'En camino',              cls: 'bg-purple-100 text-purple-700' },
  in_progress:        { label: 'En ejecución',           cls: 'bg-amber-100 text-amber-700' },
  paused:             { label: 'Pausada',                cls: 'bg-orange-100 text-orange-700' },
  pending_parts:      { label: 'Pendiente repuestos',    cls: 'bg-yellow-100 text-yellow-700' },
  pending_approval:   { label: 'Pendiente aprobación',   cls: 'bg-lime-100 text-lime-700' },
  pending_client:     { label: 'Pendiente cliente',      cls: 'bg-green-100 text-green-700' },
  completed_by_tech:  { label: 'Finalizada por técnico', cls: 'bg-teal-100 text-teal-700' },
  in_review:          { label: 'En revisión',            cls: 'bg-sky-100 text-sky-700' },
  closed:             { label: 'Cerrada',                cls: 'bg-emerald-100 text-emerald-700' },
  cancelled:          { label: 'Cancelada',              cls: 'bg-red-100 text-red-700' },
  reopened:           { label: 'Reabierta',              cls: 'bg-rose-100 text-rose-700' },
}

export default async function OrdersPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const resolvedParams = await searchParams;
  const orders = await getWorkOrders(resolvedParams.search)
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Órdenes de Trabajo</h1>
          <p className="text-sm text-slate-500">{orders.length} órdenes en el sistema</p>
        </div>
        <Link href="/ordenes/nueva" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nueva OT
        </Link>
      </div>
      
      <form method="GET" className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input name="search" defaultValue={resolvedParams.search} placeholder="Buscar por número o título..." className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm focus:border-blue-500 focus:outline-none" />
        </div>
        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700">Buscar</button>
      </form>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
          <ClipboardList className="h-12 w-12 mb-3" />
          <p className="font-medium">No hay órdenes de trabajo</p>
          <Link href="/ordenes/nueva" className="mt-3 text-sm text-blue-600 hover:underline">Crear primera orden</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold text-slate-500">Número / Título</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Estado</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Equipo</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Técnico</th>
                <th className="px-4 py-3 font-semibold text-slate-500">Fecha</th>
                <th className="px-4 py-3 font-semibold text-slate-500 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(wo => {
                const st = STATUS_MAP[wo.status] ?? { label: wo.status, cls: 'bg-slate-100 text-slate-700' }
                return (
                  <tr key={wo.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-blue-600 hover:underline"><Link href={`/ordenes/${wo.id}`}>{wo.number}</Link></p>
                      <p className="text-xs text-slate-500 mt-0.5">{wo.title}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{wo.asset?.internalCode ?? '—'}</p>
                      {wo.client && <p className="text-xs text-slate-500">{wo.client.name}</p>}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{wo.assignedTo?.name ?? 'Sin asignar'}</td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(wo.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/ordenes/${wo.id}`} className="text-blue-600 hover:underline font-medium text-xs">Abrir</Link>
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
