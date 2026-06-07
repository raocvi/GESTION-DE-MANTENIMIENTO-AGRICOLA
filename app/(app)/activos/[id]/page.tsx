import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getAssetById } from '@modules/M03_assets/actions'
import { formatDate } from '@core/lib/utils'
import { ChevronLeft, Tractor, ClipboardList, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = { title: 'Equipo — AgroMaint Pro' }

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  operative:   { label: 'Operativo', cls: 'bg-emerald-100 text-emerald-700' },
  maintenance: { label: 'En mantenimiento', cls: 'bg-amber-100 text-amber-700' },
  out_of_service: { label: 'Fuera servicio', cls: 'bg-red-100 text-red-700' },
}

export default async function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const asset = await getAssetById(resolvedParams.id)
  if (!asset) notFound()

  const st = STATUS_MAP[asset.operativeStatus] ?? { label: asset.operativeStatus, cls: 'bg-slate-100 text-slate-700' }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/activos" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
          <ChevronLeft className="h-4 w-4" /> Equipos
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100">
              <Tractor className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{asset.internalCode}</h1>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${st.cls}`}>{st.label}</span>
              </div>
              <p className="text-sm text-slate-500">{asset.name}</p>
            </div>
          </div>
          <Link href={`/ordenes/nueva?assetId=${asset.id}`} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <ClipboardList className="h-4 w-4" /> Crear OT
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Información Técnica</h2>
            <dl className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
              <div><dt className="text-slate-500">Marca</dt><dd className="font-medium text-slate-900">{asset.brand?.name ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Categoría</dt><dd className="font-medium text-slate-900">{asset.category?.name ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Modelo</dt><dd className="font-medium text-slate-900">{asset.model?.name ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Año de Fabricación</dt><dd className="font-medium text-slate-900">{asset.year ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Número de Serie / VIN</dt><dd className="font-medium text-slate-900 font-mono">{asset.serialNumber ?? '—'}</dd></div>
              <div><dt className="text-slate-500">Criticidad</dt><dd className="font-medium text-slate-900 capitalize">{asset.criticality}</dd></div>
            </dl>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900 flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Órdenes Recientes</h2>
              <Link href={`/ordenes?search=${asset.internalCode}`} className="text-sm text-blue-600 hover:underline">Ver historial completo</Link>
            </div>
            {asset.workOrders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">Sin historial de órdenes de trabajo</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {asset.workOrders.map(wo => (
                  <Link key={wo.id} href={`/ordenes/${wo.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{wo.number}</p>
                      <p className="text-xs text-slate-500">{wo.title}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-medium text-slate-600">{wo.status}</span>
                      <p className="text-xs text-slate-400">{formatDate(wo.createdAt)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm text-center">
            <h3 className="font-semibold text-slate-900 mb-2">Horómetro Actual</h3>
            <p className="text-4xl font-bold text-blue-600 font-mono">{asset.currentHours?.toFixed(1) ?? '0.0'}</p>
            <p className="text-xs text-slate-500 mt-1">Horas de operación</p>
            <button className="mt-4 w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Actualizar Lectura
            </button>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 mb-4">Ubicación y Asignación</h3>
            {asset.client ? (
              <div>
                <p className="text-sm text-slate-500">Asignado a cliente:</p>
                <Link href={`/clientes/${asset.client.id}`} className="mt-1 block font-medium text-blue-600 hover:underline">{asset.client.name}</Link>
              </div>
            ) : (
              <p className="text-sm text-slate-600 font-medium">Flota Interna (Sede Principal)</p>
            )}
          </div>

          {asset.operativeStatus !== 'operative' && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-900">Atención Requerida</h3>
                  <p className="text-sm text-amber-700 mt-1">Este equipo no está operativo actualmente. Verifique las órdenes de trabajo abiertas para resolver la situación.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
