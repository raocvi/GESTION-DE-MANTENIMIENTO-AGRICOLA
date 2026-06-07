import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getClientById } from '@modules/M06_clients/actions'
import { formatDate } from '@core/lib/utils'
import { ChevronLeft, Building2, Tractor, ClipboardList, Edit } from 'lucide-react'

export const metadata: Metadata = { title: 'Cliente — AgroMaint Pro' }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  operative:   { label: 'Operativo', cls: 'bg-emerald-100 text-emerald-700' },
  maintenance: { label: 'En mantenimiento', cls: 'bg-amber-100 text-amber-700' },
  out_of_service: { label: 'Fuera servicio', cls: 'bg-red-100 text-red-700' },
}

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const client = await getClientById(resolvedParams.id)
  if (!client) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/clientes" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Clientes
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{client.name}</h1>
              {client.name && <p className="text-sm text-slate-500">{client.name}</p>}
            </div>
          </div>
          <Link href={`/clientes/${client.id}/editar`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Edit className="h-4 w-4" /> Editar
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Equipos */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><Tractor className="h-4 w-4" /> Equipos ({client.assets.length})</h2>
              <Link href={`/activos/nuevo?clientId=${client.id}`} className="text-sm text-blue-600 hover:underline">+ Agregar equipo</Link>
            </div>
            {client.assets.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Sin equipos registrados</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {client.assets.map(asset => {
                  const st = STATUS_MAP[asset.operativeStatus] ?? { label: asset.operativeStatus, cls: 'bg-slate-100 text-slate-700' }
                  return (
                    <Link key={asset.id} href={`/activos/${asset.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{asset.internalCode}</p>
                        <p className="text-xs text-slate-500">{asset.brand?.name} {asset.model?.name}</p>
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
          {/* Últimas OTs */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Órdenes Recientes</h2>
              <Link href={`/ordenes?clientId=${client.id}`} className="text-sm text-blue-600 hover:underline">Ver todas</Link>
            </div>
            {client.workOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Sin órdenes de trabajo</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {client.workOrders.map(wo => (
                  <Link key={wo.id} href={`/ordenes/${wo.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{wo.number}</p>
                      <p className="text-xs text-slate-500">{wo.title}</p>
                    </div>
                    <span className="text-xs text-slate-400">{formatDate(wo.scheduledDate)}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Info lateral */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm h-fit">
          <h3 className="font-semibold text-slate-900 mb-4">Información de Contacto</h3>
          <dl className="space-y-3 text-sm">
            {[['Código', client.code], ['NIT', client.nit ?? '—'], ['Contacto', client.contactName ?? '—'], ['Teléfono', client.phone ?? '—'], ['Email', client.email ?? '—'], ['Ciudad', client.city ?? '—'], ['Departamento', client.department ?? '—']].map(([l, v]) => (
              <div key={l}><dt className="text-slate-500">{l}</dt><dd className="font-medium text-slate-900">{v}</dd></div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}
