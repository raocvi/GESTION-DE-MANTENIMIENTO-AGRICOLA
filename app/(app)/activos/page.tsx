import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHeader } from '@core/components/shared/PageComponents'
import { StatusBadge } from '@core/components/ui/badge'
import { formatHours, formatDate } from '@core/lib/utils'
import { Tractor, Plus, Search, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Equipos — AgroMaint Pro',
  description: 'Gestión de maquinaria agrícola CASE IH — IMECOL S.A.S.',
}

// ─── Demo data — será reemplazado por DB queries ──────────────────────────────
const demoAssets = [
  {
    id: '1',
    internalCode: 'A9900-001',
    name: 'Cosechadora CASE IH A9900',
    serialNumber: 'HAJ196810',
    model: 'A9900',
    brand: 'CASE IH',
    category: 'Cosechadora',
    operativeStatus: 'operative',
    statusLabel: 'Operativo',
    currentHours: 1248,
    year: 2022,
    client: 'Agropecuaria La Esperanza',
    city: 'Montería',
    department: 'Córdoba',
    lastService: new Date('2026-05-15'),
    nextService: 1500,
    criticality: 'critical',
  },
  {
    id: '2',
    internalCode: 'A9900-002',
    name: 'Cosechadora CASE IH A9900',
    serialNumber: 'HAJ196811',
    model: 'A9900',
    brand: 'CASE IH',
    category: 'Cosechadora',
    operativeStatus: 'maintenance',
    statusLabel: 'En mantenimiento',
    currentHours: 2105,
    year: 2021,
    client: 'Agropecuaria Los Llanos',
    city: 'Villavicencio',
    department: 'Meta',
    lastService: new Date('2026-06-01'),
    nextService: 2500,
    criticality: 'critical',
  },
  {
    id: '3',
    internalCode: 'A9900-003',
    name: 'Cosechadora CASE IH A9900',
    serialNumber: 'HAJ196812',
    model: 'A9900',
    brand: 'CASE IH',
    category: 'Cosechadora',
    operativeStatus: 'operative',
    statusLabel: 'Operativo',
    currentHours: 845,
    year: 2023,
    client: 'Hacienda Santa Rosa',
    city: 'Sincelejo',
    department: 'Sucre',
    lastService: new Date('2026-04-20'),
    nextService: 1000,
    criticality: 'critical',
  },
]

export default function AssetsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Equipos"
        description={`${demoAssets.length} equipos registrados`}
        actions={
          <Link
            href="/activos/nuevo"
            id="btn-nuevo-equipo"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" aria-hidden />
            Nuevo Equipo
          </Link>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden />
          <input
            type="search"
            placeholder="Buscar por código, serial, cliente..."
            id="search-activos"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          id="btn-filtros"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
        >
          <Filter className="h-4 w-4" aria-hidden />
          Filtros
        </button>
      </div>

      {/* KPIs rápidos */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Operativos', value: '21', color: 'text-emerald-600 bg-emerald-50', border: 'border-emerald-200' },
          { label: 'Mantenimiento', value: '3', color: 'text-amber-600 bg-amber-50', border: 'border-amber-200' },
          { label: 'Fuera servicio', value: '0', color: 'text-red-600 bg-red-50', border: 'border-red-200' },
          { label: 'Críticos x horas', value: '5', color: 'text-orange-600 bg-orange-50', border: 'border-orange-200' },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className={`rounded-xl border ${kpi.border} ${kpi.color} p-3 text-center`}
          >
            <p className="text-2xl font-bold">{kpi.value}</p>
            <p className="text-xs font-medium opacity-75">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Tabla de equipos */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm" role="table" aria-label="Lista de equipos">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Código / Equipo
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Estado
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                Cliente
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Horómetro
              </th>
              <th className="hidden px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 lg:table-cell">
                Próx. Mant.
              </th>
              <th className="hidden px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 md:table-cell">
                Último serv.
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {demoAssets.map((asset) => {
              const hoursToNext = (asset.nextService ?? 0) - (asset.currentHours ?? 0)
              const urgency = hoursToNext < 100 ? 'text-red-600' : hoursToNext < 250 ? 'text-amber-600' : 'text-slate-600'

              return (
                <tr
                  key={asset.id}
                  className="group transition-colors hover:bg-slate-50"
                >
                  {/* Código / Equipo */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                        <Tractor className="h-4 w-4 text-blue-600" aria-hidden />
                      </div>
                      <div>
                        <Link
                          href={`/activos/${asset.id}`}
                          className="font-medium text-slate-900 hover:text-blue-600"
                        >
                          {asset.internalCode}
                        </Link>
                        <p className="text-xs text-slate-500">
                          {asset.brand} {asset.model} · S/N {asset.serialNumber}
                        </p>
                      </div>
                    </div>
                  </td>
                  {/* Estado */}
                  <td className="px-4 py-3">
                    <StatusBadge
                      status={asset.operativeStatus}
                      label={asset.statusLabel}
                    />
                  </td>
                  {/* Cliente */}
                  <td className="hidden px-4 py-3 md:table-cell">
                    <p className="text-sm text-slate-700">{asset.client}</p>
                    <p className="text-xs text-slate-400">
                      {asset.city}, {asset.department}
                    </p>
                  </td>
                  {/* Horómetro */}
                  <td className="px-4 py-3 text-right font-mono text-sm text-slate-700">
                    {formatHours(asset.currentHours)}
                  </td>
                  {/* Próximo mantenimiento */}
                  <td className={`hidden px-4 py-3 text-right font-mono text-sm lg:table-cell ${urgency}`}>
                    {formatHours(asset.nextService)}
                    <span className="block text-xs">
                      ({hoursToNext > 0 ? `faltan ${hoursToNext}h` : 'VENCIDO'})
                    </span>
                  </td>
                  {/* Último servicio */}
                  <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                    {formatDate(asset.lastService)}
                  </td>
                  {/* Acciones */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        href={`/activos/${asset.id}`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                        id={`btn-ver-${asset.id}`}
                      >
                        Ver
                      </Link>
                      <Link
                        href={`/ordenes/nueva?assetId=${asset.id}`}
                        className="rounded-md px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                        id={`btn-ot-${asset.id}`}
                      >
                        Nueva OT
                      </Link>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
