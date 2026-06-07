import type { Metadata } from 'next'
import Link from 'next/link'
import { getServiceRequests } from '@modules/M10_service_requests/actions'
import { formatDate } from '@core/lib/utils'
import { MessageSquarePlus, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Solicitudes de Servicio — AgroMaint Pro' }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  open:       { label: 'Abierta',         cls: 'bg-blue-100 text-blue-700' },
  reviewing:  { label: 'En revisión',     cls: 'bg-amber-100 text-amber-700' },
  approved:   { label: 'Aprobada',        cls: 'bg-teal-100 text-teal-700' },
  rejected:   { label: 'Rechazada',       cls: 'bg-red-100 text-red-700' },
  converted:  { label: 'Convertida en OT',cls: 'bg-emerald-100 text-emerald-700' },
}

export default async function ServiceRequestsPage() {
  const requests = await getServiceRequests()
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Solicitudes de Servicio</h1>
          <p className="text-sm text-slate-500">{requests.length} solicitudes</p>
        </div>
        <Link href="/solicitudes/nueva" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          <Plus className="h-4 w-4" /> Nueva Solicitud
        </Link>
      </div>
      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white py-16 text-slate-400">
          <MessageSquarePlus className="h-12 w-12 mb-3" />
          <p className="font-medium">No hay solicitudes de servicio</p>
          <Link href="/solicitudes/nueva" className="mt-3 text-sm text-blue-600 hover:underline">Crear primera solicitud</Link>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Solicitud</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Prioridad</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">Cliente</th>
                <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">Equipo</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.map(req => {
                const st = STATUS_MAP[req.status] ?? { label: req.status, cls: 'bg-slate-100 text-slate-700' }
                return (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{req.title}</p>
                      {req.description && <p className="text-xs text-slate-500 truncate max-w-xs">{req.description}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 capitalize">{req.status}</td>
                    <td className="hidden px-4 py-3 md:table-cell text-xs text-slate-600">{req.client?.name ?? '—'}</td>
                    <td className="hidden px-4 py-3 lg:table-cell text-xs text-slate-600">{req.asset?.internalCode ?? '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(req.createdAt)}</td>
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
