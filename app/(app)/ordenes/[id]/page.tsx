import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getWorkOrderById, updateWorkOrderStatus } from '@modules/M04_work_orders/actions'
import { formatDate } from '@core/lib/utils'
import { ChevronLeft, ClipboardList, Tractor, User } from 'lucide-react'

export const metadata: Metadata = { title: 'Orden de Trabajo — AgroMaint Pro' }

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

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const wo = await getWorkOrderById(resolvedParams.id)
  if (!wo) notFound()
  
  const st = STATUS_MAP[wo.status] ?? { label: wo.status, cls: 'bg-slate-100 text-slate-700' }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/ordenes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
            <ChevronLeft className="h-4 w-4" /> Órdenes de Trabajo
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <ClipboardList className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900">{wo.number}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${st.cls}`}>{st.label}</span>
              </div>
              <p className="text-slate-500 font-medium">{wo.title}</p>
            </div>
          </div>
        </div>
        {wo.status !== 'closed' && wo.status !== 'cancelled' && (
          <form action={async () => {
            'use server'
            await updateWorkOrderStatus(wo.id, wo.status === 'new' ? 'assigned' : wo.status === 'assigned' ? 'in_progress' : wo.status === 'in_progress' ? 'completed_by_tech' : 'closed')
          }}>
            <button type="submit" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
              Avanzar Estado →
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Detalles de la Orden</h2>
            <div className="prose prose-sm max-w-none text-slate-600">
              {wo.description ? <p className="whitespace-pre-wrap">{wo.description}</p> : <p className="italic">Sin descripción detallada.</p>}
            </div>
          </div>
          
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Ejecución y Tareas</h2>
            <p className="text-sm text-slate-500 italic text-center py-6">Módulo de tareas en construcción...</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><Tractor className="h-4 w-4 text-slate-500" /> Equipo</h3>
            {wo.asset ? (
              <div>
                <p className="font-medium text-blue-600 hover:underline"><Link href={`/activos/${wo.asset.id}`}>{wo.asset.internalCode}</Link></p>
                <p className="text-sm text-slate-600 mt-1">{wo.asset.name}</p>
                {wo.client && <p className="text-xs text-slate-500 mt-2 border-t border-slate-100 pt-2">Cliente: <strong>{wo.client.name}</strong></p>}
              </div>
            ) : (
              <p className="text-sm text-slate-400">Sin equipo asignado</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /> Asignación</h3>
            <dl className="space-y-3 text-sm">
              <div><dt className="text-slate-500">Técnico Responsable</dt><dd className="font-medium text-slate-900">{wo.assignedTo?.name ?? 'No asignado'}</dd></div>
              <div><dt className="text-slate-500">Prioridad</dt><dd className="font-medium text-slate-900 capitalize">{wo.priority}</dd></div>
              <div><dt className="text-slate-500">Tipo de Servicio</dt><dd className="font-medium text-slate-900 capitalize">{wo.type}</dd></div>
              <div><dt className="text-slate-500">Fecha Creación</dt><dd className="font-medium text-slate-900">{formatDate(wo.createdAt)}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
